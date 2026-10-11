// Cookie de sesion de los usuarios del sitio: firmar y verificar.
// Va aparte de lib/usuarios.ts para que el proxy la pueda usar sin cargar la base.
import { createHmac, timingSafeEqual } from "node:crypto";

export const COOKIE_SESION = "ap_sesion";
const DURACION_SESION_S = 60 * 60 * 24 * 30; // 30 dias

function secreto(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("Falta NEXTAUTH_SECRET");
  return "alquilopinamar-dev";
}

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

// Devuelve el id del usuario si la cookie es valida y no vencio; si no, null.
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
