// BACKUP DE LA BASE — SOLO LECTURA.
// Copia todas las tablas a backups/<origen>-<fecha>/<Tabla>.json y muestra
// cuantas filas tiene cada una. Corre dentro de una transaccion READ ONLY:
// Postgres rechaza cualquier escritura, asi que no puede modificar ni borrar nada.
//
// Uso:
//   npm run db:backup            -> produccion (lee PROD_DATABASE_URL de .env.prod-db)
//   npm run db:backup -- local   -> base local  (lee DATABASE_URL de .env)
import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { urlLocal, urlProduccion, opcionesConexion } from "./_env.mjs";

export async function hacerBackup(origen) {
  const url = origen === "local" ? urlLocal() : urlProduccion();

  // Todos los valores se leen como texto, tal cual los guarda Postgres. Asi las
  // fechas, decimales, JSON y listas se pueden volver a cargar sin perder nada.
  const client = new pg.Client({ ...opcionesConexion(url), types: { getTypeParser: () => (v) => v } });
  await client.connect();

  try {
    await client.query("BEGIN TRANSACTION READ ONLY");

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const dir = path.join("backups", origen + "-" + stamp);
    fs.mkdirSync(dir, { recursive: true });

    const tablas = (
      await client.query(
        `SELECT table_name FROM information_schema.tables
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`
      )
    ).rows.map((r) => r.table_name);

    const counts = {};
    for (const t of tablas) {
      const rows = (await client.query(`SELECT * FROM "public"."${t}"`)).rows;
      fs.writeFileSync(path.join(dir, t + ".json"), JSON.stringify(rows, null, 2));
      counts[t] = rows.length;
    }

    fs.writeFileSync(path.join(dir, "_resumen.json"), JSON.stringify({ origen, fecha: stamp, counts }, null, 2));
    await client.query("ROLLBACK");
    return { dir, counts };
  } finally {
    await client.end();
  }
}

// Solo corre si se llama directo (no cuando lo importa db-deploy-prod).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const origen = process.argv[2] === "local" ? "local" : "prod";
  try {
    const { dir, counts } = await hacerBackup(origen);
    console.log("\nBackup de " + (origen === "local" ? "la base LOCAL" : "PRODUCCION") + " guardado en " + dir + "\n");
    console.table(counts);
  } catch (e) {
    console.error("\nNo se pudo hacer el backup: " + e.message + "\n");
    process.exit(1);
  }
}
