// Firma de la cookie de sesion de usuarios (no la del admin, que es NextAuth).
// Usa Web Crypto para poder correr tanto en el servidor como en proxy.ts.
//
// Valor de la cookie: <userId>.<vence en ms>.<firma HMAC-SHA256>
// Dura 30 dias y se renueva sola mientras la persona siga entrando (proxy.ts),
// asi solo vuelve a pedir el link quien no entro en 30 dias seguidos.

export const COOKIE_SESION = "ap_sesion";
export const DURACION_SESION_S = 60 * 60 * 24 * 30; // 30 dias
const RENOVAR_DESPUES_MS = 1000 * 60 * 60 * 24; // se re-firma como mucho una vez por dia

export const OPCIONES_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: DURACION_SESION_S,
};

function secreto(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("Falta NEXTAUTH_SECRET");
  return s || "alquilopinamar-dev-secret";
}

let clave: Promise<CryptoKey> | null = null;
function claveHmac() {
  clave ??= crypto.subtle.importKey("raw", new TextEncoder().encode("sesion:" + secreto()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return clave;
}

async function firmar(texto: string): Promise<string> {
  const firma = await crypto.subtle.sign("HMAC", await claveHmac(), new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(firma), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Comparacion en tiempo constante
function iguales(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function crearValorSesion(userId: string): Promise<string> {
  const datos = userId + "." + (Date.now() + DURACION_SESION_S * 1000);
  return datos + "." + (await firmar(datos));
}

// Devuelve el userId si la cookie es valida y no vencio, y si conviene renovarla.
export async function leerValorSesion(valor: string | undefined | null): Promise<{ userId: string; renovar: boolean } | null> {
  if (!valor) return null;
  const partes = valor.split(".");
  if (partes.length !== 3) return null;
  const [userId, venceTexto, firma] = partes;
  if (!/^[a-z0-9]{10,40}$/.test(userId)) return null;
  if (!iguales(firma, await firmar(userId + "." + venceTexto))) return null;
  const vence = Number(venceTexto);
  if (!Number.isFinite(vence) || vence <= Date.now()) return null;
  return { userId, renovar: vence - Date.now() < DURACION_SESION_S * 1000 - RENOVAR_DESPUES_MS };
}
