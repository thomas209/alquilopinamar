// Alta o actualizacion de un usuario del admin, pidiendo los datos por la terminal.
// La contraseña no se muestra al escribirla y se guarda encriptada (bcrypt).
import readline from "readline";
import bcrypt from "bcryptjs";

export function preguntar(texto, { oculto = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (oculto) {
      rl._writeToOutput = (s) => {
        if (s.includes(texto)) rl.output.write(texto);
      };
    }
    rl.question(texto, (r) => {
      rl.close();
      if (oculto) process.stdout.write("\n");
      resolve(r.trim());
    });
  });
}

export async function crearAdmin(prisma) {
  const email = (await preguntar("Mail: ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("El mail no es válido.");

  const name = await preguntar("Nombre: ");
  if (!name) throw new Error("Falta el nombre.");

  const password = await preguntar("Contraseña (mínimo 10 caracteres, no se ve al escribir): ", { oculto: true });
  if (password.length < 10) throw new Error("La contraseña tiene que tener al menos 10 caracteres.");
  const repetida = await preguntar("Repetí la contraseña: ", { oculto: true });
  if (repetida !== password) throw new Error("Las contraseñas no coinciden.");

  const passwordHash = await bcrypt.hash(password, 12);
  const existia = await prisma.adminUser.findUnique({ where: { email } });
  await prisma.adminUser.upsert({
    where: { email },
    update: { name, passwordHash, isActive: true },
    create: { email, name, passwordHash, role: "SUPERADMIN" },
  });
  return { email, existia: Boolean(existia) };
}
