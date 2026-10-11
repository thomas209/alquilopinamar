// Cuentas de usuario del sitio (Fase 2c): link magico y sesion.
// Reglas en docs/06-business-rules.md → Usuarios.
//
// - El link vence a los 15 minutos y es de un solo uso. En la base se guarda el
//   hash del token, nunca el token.
// - La sesion es una cookie firmada (HMAC) que dura 30 dias, igual que en Member.
//   Esta separada por completo del login del admin (NextAuth).
// - En cada pedido se vuelve a leer el usuario: si lo bloquean, deja de entrar.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESION, leerCookieSesion } from "@/lib/sesion";

export const DURACION_LINK_MIN = 15;

// Limites para pedir links (cuidan el cupo de mails y frenan abusos)
export const MAX_LINKS_POR_MAIL = 3; // cada 15 minutos
export const MAX_LINKS_POR_IP = 10; // por hora

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const esMailValido = (m: string) => m.length <= 120 && MAIL.test(m);

// ---------- Link magico ----------

export function nuevoToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// "volver" solo acepta rutas internas: empieza con "/" y no con "//".
// Sin barras invertidas ni caracteres de control (el navegador los ignora y
// "/\t/otro-sitio.com" terminaria en otro sitio).
export function rutaVolver(valor: unknown): string {
  if (typeof valor !== "string") return "/cuenta";
  const v = valor.trim().slice(0, 300);
  if (!v.startsWith("/") || v.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(v)) return "/cuenta";
  if (v.startsWith("/cuenta/entrar") || v.startsWith("/cuenta/ingresar")) return "/cuenta";
  return v;
}

// ---------- Sesion ----------

export { COOKIE_SESION, OPCIONES_COOKIE, leerCookieSesion, valorCookieSesion } from "@/lib/sesion";

// Lo que el navegador puede saber del usuario (nada interno).
export const CAMPOS_PUBLICOS = { id: true, email: true, firstName: true, lastName: true, phone: true, whatsapp: true, isHost: true } as const;

// Usuario con sesion iniciada, o null. Para Server Components y Route Handlers.
export async function usuarioActual() {
  const id = leerCookieSesion((await cookies()).get(COOKIE_SESION)?.value);
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { ...CAMPOS_PUBLICOS, isBlocked: true } });
  if (!u || u.isBlocked) return null;
  return { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName, phone: u.phone, whatsapp: u.whatsapp, isHost: u.isHost };
}

export type UsuarioPublico = NonNullable<Awaited<ReturnType<typeof usuarioActual>>>;
