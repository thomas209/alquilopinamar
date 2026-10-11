// Cuentas de usuario del sitio (Fase 2c): link magico y sesion.
// Reglas en docs/06-business-rules.md → Usuarios.
//
// - El link vence a los 15 minutos y es de un solo uso. En la base se guarda el
//   hash del token, nunca el token.
// - La sesion es una cookie firmada (HMAC) que dura 30 dias, igual que en Member.
//   Esta separada por completo del login del admin (NextAuth).
// - En cada pedido se vuelve a leer el usuario: si lo bloquean, deja de entrar.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const COOKIE_SESION = "ap_sesion";
const DURACION_SESION_S = 60 * 60 * 24 * 30; // 30 dias
export const DURACION_LINK_MIN = 15;

// Limites para pedir links (cuidan el cupo de mails y frenan abusos)
export const MAX_LINKS_POR_MAIL = 3; // cada 15 minutos
export const MAX_LINKS_POR_IP = 10; // por hora

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const esMailValido = (m: string) => m.length <= 120 && MAIL.test(m);

function secreto(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Falta NEXTAUTH_SECRET");
  return "alquilopinamar-dev";
}

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

function firmar(payload: string): string {
  return createHmac("sha256", secreto())
    .update("usuario:" + payload)
    .digest("base64url");
}

export function valorCookieSesion(userId: string): string {
  const vence = Date.now() + DURACION_SESION_S * 1000;
  const payload = userId + "." + vence;
  return payload + "." + firmar(payload);
}

export function leerCookieSesion(valor: string | undefined | null): string | null {
  if (!valor) return null;
  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [userId, venceTxt, firma] = partes;
  const esperada = Buffer.from(firmar(userId + "." + venceTxt));
  const recibida = Buffer.from(firma);
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) return null;
  const vence = Number(venceTxt);
  if (!Number.isFinite(vence) || Date.now() > vence) return null;
  return userId;
}

export const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURACION_SESION_S,
};

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
