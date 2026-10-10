// Usuarios del sitio: sesion actual, links de ingreso y validaciones.
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_SESION, leerValorSesion } from "@/lib/sesion-firma";

export const MINUTOS_LINK = 15;
export const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export const nuevoToken = () => randomBytes(32).toString("base64url");

// Ruta interna segura para volver despues de entrar (nada de otros sitios).
export function rutaVolver(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  if (!/^\/(?!\/)[\w\-./?=&%]{0,200}$/.test(valor) || valor.startsWith("/api") || valor.startsWith("/admin")) return null;
  return valor;
}

// Usuario con sesion iniciada (o null). Para Server Components y endpoints.
export async function usuarioActual() {
  const sesion = await leerValorSesion((await cookies()).get(COOKIE_SESION)?.value);
  if (!sesion) return null;
  const u = await prisma.user.findUnique({ where: { id: sesion.userId } });
  return u && !u.isBlocked ? u : null;
}

export type Usuario = NonNullable<Awaited<ReturnType<typeof usuarioActual>>>;
export const nombreCompleto = (u: Pick<Usuario, "firstName" | "lastName">) => [u.firstName, u.lastName].filter(Boolean).join(" ");
