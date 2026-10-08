// CREA (O ACTUALIZA) UN USUARIO DEL ADMIN en la base local.
// Pide mail, nombre y contraseña por la terminal. La contraseña no se muestra
// mientras se escribe y se guarda encriptada (nunca en texto plano).
//
// Uso: npm run admin:crear
// En produccion: npm run db:preparar-prod (pide confirmacion y hace backup).
import { PrismaClient } from "@prisma/client";
import { crearAdmin } from "./_admin.mjs";

const prisma = new PrismaClient();

try {
  console.log("\nCrear usuario del admin (base local)\n");
  const { email, existia } = await crearAdmin(prisma);
  console.log("\nListo: usuario " + email + (existia ? " actualizado." : " creado.") + " Ya podés entrar en /admin/login\n");
} catch (e) {
  console.error("\nNo se pudo crear el usuario: " + e.message + "\n");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
