// GUARDIA DE LA BASE.
// Corre antes de "npm run dev", "db:migrate" y "db:studio". Si alguna
// DATABASE_URL que pueda llegar a usar Prisma o Next no apunta a esta maquina,
// corta todo. Asi ningun comando de desarrollo puede tocar produccion.
import fs from "fs";
import { leerEnv, esLocal, hostDe } from "./_env.mjs";

// Todos los archivos de entorno que Next y Prisma leen en desarrollo.
const ARCHIVOS = [".env", ".env.local", ".env.development", ".env.development.local"];

const problemas = [];
let encontrada = false;

for (const archivo of ARCHIVOS) {
  const url = leerEnv(archivo).DATABASE_URL;
  if (!url) continue;
  encontrada = true;
  if (!esLocal(url)) problemas.push(archivo + " -> " + (hostDe(url) ?? "URL invalida"));
}

// Una variable exportada en la terminal le gana a los archivos.
if (process.env.DATABASE_URL) {
  encontrada = true;
  if (!esLocal(process.env.DATABASE_URL)) {
    problemas.push("variable DATABASE_URL de la terminal -> " + (hostDe(process.env.DATABASE_URL) ?? "URL invalida"));
  }
}

if (problemas.length > 0) {
  console.error("\nBLOQUEADO: DATABASE_URL no apunta a la base local.\n");
  for (const p of problemas) console.error("  - " + p);
  console.error("\nLa URL de produccion va SOLO en .env.prod-db (ver docs/base-de-datos.md).\n");
  process.exit(1);
}

if (!fs.existsSync(".env") || !encontrada) {
  console.error('\nFalta DATABASE_URL. Crea el archivo ".env" con:  cp .env.example .env\n');
  process.exit(1);
}
