// APLICA MIGRACIONES PENDIENTES EN PRODUCCION.
// Es la UNICA forma permitida de cambiar la base de produccion.
// Pasos: muestra lo pendiente -> avisa si hay algo destructivo -> backup ->
// pide escribir "APLICAR EN PRODUCCION" -> prisma migrate deploy -> backup ->
// compara cantidad de filas antes y despues.
//
// Uso: npm run db:deploy-prod   (solo con OK explicito de Tommy)
import pg from "pg";
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { urlProduccion, opcionesConexion, hostDe, preguntar } from "./_env.mjs";
import { hacerBackup } from "./db-backup.mjs";

const DIR_MIGRACIONES = path.join("prisma", "migrations");
const FRASE = "APLICAR EN PRODUCCION";

try {
  const url = urlProduccion();

  const locales = fs.existsSync(DIR_MIGRACIONES)
    ? fs.readdirSync(DIR_MIGRACIONES).filter((d) => fs.existsSync(path.join(DIR_MIGRACIONES, d, "migration.sql"))).sort()
    : [];
  if (!locales.length) throw new Error("No hay migraciones en prisma/migrations.");

  // Que migraciones ya tiene produccion (solo lectura)
  const client = new pg.Client(opcionesConexion(url));
  await client.connect();
  let aplicadas = [];
  let fallidas = [];
  try {
    await client.query("BEGIN TRANSACTION READ ONLY");
    const existe = (await client.query(`SELECT to_regclass('public._prisma_migrations') AS t`)).rows[0].t;
    if (existe) {
      const rows = (await client.query(`SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`)).rows;
      aplicadas = rows.filter((r) => r.finished_at && !r.rolled_back_at).map((r) => r.migration_name);
      fallidas = rows.filter((r) => !r.finished_at && !r.rolled_back_at).map((r) => r.migration_name);
    }
    await client.query("ROLLBACK");
  } finally {
    await client.end();
  }

  if (fallidas.length) {
    throw new Error("Produccion tiene migraciones que quedaron a medias: " + fallidas.join(", ") + ". Hay que resolverlas a mano antes de seguir.");
  }
  const desconocidas = aplicadas.filter((m) => !locales.includes(m));
  if (desconocidas.length) {
    throw new Error("Produccion tiene migraciones que no estan en este repo: " + desconocidas.join(", ") + ". Actualiza el repo (git pull) antes de seguir.");
  }

  const pendientes = locales.filter((m) => !aplicadas.includes(m));
  console.log("\nBase de PRODUCCION: " + hostDe(url));
  if (!pendientes.length) {
    console.log("No hay migraciones pendientes. No se toco nada.\n");
    process.exit(0);
  }

  console.log("\nMigraciones pendientes (" + pendientes.length + "):");
  let destructivo = false;
  for (const m of pendientes) {
    console.log("  - " + m);
    const lineas = fs.readFileSync(path.join(DIR_MIGRACIONES, m, "migration.sql"), "utf8").split(/\r?\n/);
    lineas.forEach((linea, i) => {
      const sinComentario = linea.replace(/--.*$/, "");
      if (/\b(DROP|DELETE|TRUNCATE)\b/i.test(sinComentario)) {
        destructivo = true;
        console.log("      ATENCION linea " + (i + 1) + ": " + linea.trim());
      }
    });
  }
  if (destructivo) {
    console.log("\n*** HAY SENTENCIAS QUE BORRAN DATOS O ESTRUCTURA (DROP / DELETE / TRUNCATE). ***");
    console.log("*** Revisalas una por una antes de seguir. Si dudas, cancela. ***");
  }

  console.log("\nHaciendo backup de produccion antes de aplicar...");
  const antes = await hacerBackup("prod");
  console.log("Backup guardado en " + antes.dir);
  console.table(antes.counts);

  const r = await preguntar('\nPara aplicar en produccion escribi exactamente "' + FRASE + '": ');
  if (r !== FRASE) {
    console.log("Cancelado. No se aplico nada en produccion.\n");
    process.exit(0);
  }

  const res = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
    shell: process.platform === "win32",
  });
  if (res.status !== 0) {
    throw new Error("prisma migrate deploy fallo. El backup previo esta en " + antes.dir);
  }

  console.log("\nHaciendo backup de produccion despues de aplicar...");
  const despues = await hacerBackup("prod");

  const comparacion = {};
  let perdidas = false;
  for (const t of new Set([...Object.keys(antes.counts), ...Object.keys(despues.counts)])) {
    const a = antes.counts[t];
    const d = despues.counts[t];
    let estado = "igual";
    if (a === undefined) estado = "tabla nueva";
    else if (d === undefined) { estado = "TABLA BORRADA"; perdidas = true; }
    else if (d < a) { estado = "PERDIO FILAS"; perdidas = true; }
    else if (d > a) estado = "mas filas";
    comparacion[t] = { antes: a ?? "-", despues: d ?? "-", estado };
  }
  console.table(comparacion);
  if (perdidas) {
    console.log("\n*** ATENCION: hay tablas con menos filas que antes. Backup previo: " + antes.dir + " ***\n");
  } else {
    console.log("\nListo: migraciones aplicadas y no se perdio ninguna fila.\n");
  }
} catch (e) {
  console.error("\nNo se pudo completar: " + e.message + "\n");
  process.exit(1);
}
