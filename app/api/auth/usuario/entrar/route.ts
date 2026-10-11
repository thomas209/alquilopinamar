import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson } from "@/lib/api";
import { COOKIE_SESION, hashToken, OPCIONES_COOKIE, rutaVolver, valorCookieSesion } from "@/lib/usuarios";

const LINK_INVALIDO = "El link venció o ya se usó. Pedí uno nuevo.";

// Usa el link magico: valida el token, crea la cuenta si es la primera vez y
// deja la sesion iniciada. Es POST (desde un boton de la pagina /cuenta/entrar)
// y no GET, para que los antivirus y las vistas previas de los mails, que abren
// los links solos, no gasten el link antes que la persona.
export async function POST(request: Request) {
  const body = await leerJson(request);
  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!/^[A-Za-z0-9_-]{30,100}$/.test(token)) return errorJson(LINK_INVALIDO, 400);

  const ahora = new Date();
  const pedido = await prisma.loginToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!pedido || pedido.usedAt || pedido.expiresAt <= ahora) return errorJson(LINK_INVALIDO, 400);

  // Se marca como usado de forma atomica: si llegan dos pedidos juntos, entra uno solo
  const usado = await prisma.loginToken.updateMany({ where: { id: pedido.id, usedAt: null }, data: { usedAt: ahora } });
  if (usado.count === 0) return errorJson(LINK_INVALIDO, 400);

  const usuario = await prisma.user.upsert({
    where: { email: pedido.email },
    create: { email: pedido.email, lastLoginAt: ahora },
    update: { lastLoginAt: ahora },
    select: { id: true, isBlocked: true },
  });
  if (usuario.isBlocked) return errorJson("Esta cuenta está suspendida. Si creés que es un error, escribinos.", 403);

  // Los otros links pendientes de ese mail dejan de servir
  await prisma.loginToken.updateMany({ where: { email: pedido.email, usedAt: null }, data: { usedAt: ahora } });

  (await cookies()).set(COOKIE_SESION, valorCookieSesion(usuario.id), OPCIONES_COOKIE);
  return NextResponse.json({ ok: true, volver: rutaVolver(pedido.volver) });
}
