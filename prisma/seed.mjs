// DATOS INICIALES: las 5 zonas y los amenities base (ver prisma/datos-iniciales.mjs).
// Se puede correr todas las veces que haga falta: no duplica ni pisa lo que
// ya se haya editado desde el admin (solo crea lo que falta).
//
// Uso: npm run db:seed   (solo base local; pasa por db-guard)
// En produccion se usa una sola vez: npm run db:preparar-prod
import { PrismaClient } from "@prisma/client";
import { cargarDatosIniciales } from "./datos-iniciales.mjs";

const prisma = new PrismaClient();

try {
  const { zonas, amenities } = await cargarDatosIniciales(prisma);
  console.log("\nDatos iniciales cargados: " + zonas + " zonas nuevas, " + amenities + " amenities nuevos.\n");
} catch (e) {
  console.error("\nNo se pudieron cargar los datos iniciales: " + e.message + "\n");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
