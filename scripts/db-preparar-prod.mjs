// PREPARA LA BASE DE PRODUCCION (una sola vez, al publicar).
// Despues de aplicar las migraciones con "npm run db:deploy-prod":
//   1) carga las zonas y amenities que falten (no pisa ni borra nada),
//   2) crea o actualiza tu usuario del admin.
// Solo inserta o actualiza: nunca borra. Hace backup antes y pide confirmacion.
//
// Uso: npm run db:preparar-prod   (solo con OK explicito de Tommy)
import { PrismaClient } from "@prisma/client";
import { urlProduccion, hostDe, preguntar } from "./_env.mjs";
import { hacerBackup } from "./db-backup.mjs";
import { crearAdmin } from "./_admin.mjs";
import { cargarDatosIniciales } from "../prisma/datos-iniciales.mjs";

const FRASE = "PREPARAR PRODUCCION";

let prisma;
try {
  const url = urlProduccion();
  console.log("\nBase de PRODUCCION: " + hostDe(url) + "\n");

  prisma = new PrismaClient({ datasourceUrl: url });
  const tablas = await prisma.$queryRaw`SELECT to_regclass('public."Zone"')::text AS zona, to_regclass('public."AdminUser"')::text AS admin`;
  if (!tablas[0]?.zona || !tablas[0]?.admin) {
    throw new Error('Producción todavía no tiene las tablas. Primero corré "npm run db:deploy-prod".');
  }

  console.log("Esto va a:");
  console.log("  - cargar las zonas y amenities base que falten (no toca las existentes)");
  console.log("  - crear o actualizar un usuario del admin\n");

  const { dir } = await hacerBackup("prod");
  console.log("Backup previo guardado en " + dir + "\n");

  const respuesta = await preguntar('Para seguir escribí "' + FRASE + '": ');
  if (respuesta !== FRASE) throw new Error("Cancelado: no se cambió nada.");

  const { zonas, amenities } = await cargarDatosIniciales(prisma);
  console.log("\nDatos iniciales: " + zonas + " zonas nuevas, " + amenities + " amenities nuevos.\n");

  console.log("Usuario del admin de producción\n");
  const { email, existia } = await crearAdmin(prisma);
  console.log("\nListo: usuario " + email + (existia ? " actualizado." : " creado.") + "\n");
} catch (e) {
  console.error("\n" + e.message + "\n");
  process.exitCode = 1;
} finally {
  await prisma?.$disconnect();
}
