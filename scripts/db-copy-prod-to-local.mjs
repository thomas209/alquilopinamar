// COPIA EL ULTIMO BACKUP DE PRODUCCION A LA BASE LOCAL.
// Nunca se conecta a produccion: lee los archivos de backups/prod-*/ y los
// carga en la base local (la de .env), reemplazando lo que haya ahi.
//
// Uso:
//   npm run db:copy-to-local                      -> usa el ultimo backup de produccion
//   npm run db:copy-to-local -- backups/prod-...  -> usa ese backup
//   agregar --si para no pedir confirmacion
import pg from "pg";
import fs from "fs";
import path from "path";
import { urlLocal, preguntar } from "./_env.mjs";

const args = process.argv.slice(2);
const sinPreguntar = args.includes("--si");
const dirArg = args.find((a) => !a.startsWith("--"));

function ultimoBackupProd() {
  if (!fs.existsSync("backups")) return null;
  const dirs = fs.readdirSync("backups").filter((d) => d.startsWith("prod-")).sort();
  return dirs.length ? path.join("backups", dirs[dirs.length - 1]) : null;
}

try {
  const url = urlLocal(); // corta si .env no apunta a esta maquina
  const dir = dirArg || ultimoBackupProd();
  if (!dir || !fs.existsSync(dir)) {
    throw new Error("No hay backups de produccion. Corre primero: npm run db:backup");
  }

  const enBackup = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((t) => t !== "_prisma_migrations");

  console.log("\nSe va a REEMPLAZAR el contenido de la base LOCAL con el backup:\n  " + dir + "\n");
  if (!sinPreguntar) {
    const r = await preguntar('Escribi "si" para continuar: ');
    if (r.toLowerCase() !== "si") {
      console.log("Cancelado. No se toco nada.\n");
      process.exit(0);
    }
  }

  const client = new pg.Client({ connectionString: url });
  await client.connect();

  try {
    // Columnas que existen hoy en la base local
    const cols = {};
    for (const r of (
      await client.query(
        `SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'`
      )
    ).rows) {
      (cols[r.table_name] ||= []).push(r.column_name);
    }

    const tablas = enBackup.filter((t) => cols[t]);
    const faltanLocal = enBackup.filter((t) => !cols[t]);

    // Orden de carga: primero las tablas de las que dependen otras
    const deps = {};
    for (const r of (
      await client.query(
        `SELECT c.conrelid::regclass::text AS hija, c.confrelid::regclass::text AS padre
         FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace
         WHERE c.contype = 'f' AND n.nspname = 'public'`
      )
    ).rows) {
      const hija = r.hija.replace(/"/g, "");
      const padre = r.padre.replace(/"/g, "");
      if (hija !== padre) (deps[hija] ||= new Set()).add(padre);
    }
    const orden = [];
    const visto = new Set();
    const visitar = (t) => {
      if (visto.has(t)) return;
      visto.add(t);
      for (const p of deps[t] || []) if (tablas.includes(p)) visitar(p);
      orden.push(t);
    };
    tablas.forEach(visitar);

    await client.query("BEGIN");
    if (orden.length) {
      await client.query("TRUNCATE " + orden.map((t) => `"public"."${t}"`).join(", ") + " CASCADE");
    }

    const counts = {};
    const avisos = [];
    for (const t of orden) {
      const rows = JSON.parse(fs.readFileSync(path.join(dir, t + ".json"), "utf8"));
      counts[t] = rows.length;
      if (!rows.length) continue;
      const delBackup = Object.keys(rows[0]);
      const comunes = delBackup.filter((c) => cols[t].includes(c));
      const sobran = delBackup.filter((c) => !cols[t].includes(c));
      if (sobran.length) avisos.push(t + ": la base local no tiene las columnas " + sobran.join(", ") + " (se omiten)");
      const sql =
        `INSERT INTO "public"."${t}" (` + comunes.map((c) => `"${c}"`).join(", ") + ") VALUES (" +
        comunes.map((_, i) => "$" + (i + 1)).join(", ") + ")";
      for (const row of rows) await client.query(sql, comunes.map((c) => row[c]));
    }

    // Los contadores automaticos (ej: codigo de propiedad) siguen desde el maximo cargado
    for (const t of orden) {
      for (const c of cols[t]) {
        const seq = (await client.query("SELECT pg_get_serial_sequence($1, $2) AS s", [`"public"."${t}"`, c])).rows[0].s;
        if (!seq) continue;
        await client.query(
          `SELECT setval($1, COALESCE((SELECT MAX("${c}") FROM "public"."${t}"), 1), (SELECT MAX("${c}") FROM "public"."${t}") IS NOT NULL)`,
          [seq]
        );
      }
    }

    await client.query("COMMIT");
    console.log("\nBase local actualizada desde " + dir + "\n");
    console.table(counts);
    for (const a of avisos) console.log("Aviso: " + a);
    if (faltanLocal.length) {
      console.log("Aviso: estas tablas del backup no existen en la base local y se omitieron: " + faltanLocal.join(", "));
    }
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
} catch (e) {
  console.error("\nNo se pudo copiar: " + e.message + "\nLa base local quedo como estaba.\n");
  process.exit(1);
}
