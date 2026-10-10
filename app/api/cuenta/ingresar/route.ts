import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson, texto } from "@/lib/api";
import { COOKIE_SESION, crearValorSesion, OPCIONES_COOKIE } from "@/lib/sesion-firma";
import { hashToken } from "@/lib/usuarios";

// Usa el link del mail: lo marca como usado, crea la cuenta si no existe y deja la sesion.
// Es un POST (lo dispara el boton "Entrar" de /ingresar/confirmar) para que los
// antivirus del correo que abren los links solos no lo gasten.
export async function POST(request: Request) {
  const token = texto((await leerJson(request)).token, 100);
  if (!token) return errorJson("El link no es válido.");

  const link = await prisma.loginLink.findUnique({ where: { tokenHash: hashToken(token) } });
  const vencido = !link || link.usedAt !== null || link.expiresAt.getTime() <= Date.now();
  if (vencido) return errorJson("El link venció o ya se usó. Pedí uno nuevo.", 410);

  // Una sola vez, aunque lleguen dos pedidos juntos
  const marcado = await prisma.loginLink.updateMany({ where: { id: link.id, usedAt: null }, data: { usedAt: new Date() } });
  if (marcado.count !== 1) return errorJson("El link venció o ya se usó. Pedí uno nuevo.", 410);

  const usuario = await prisma.user.upsert({
    where: { email: link.email },
    update: { lastLoginAt: new Date() },
    create: { email: link.email, lastLoginAt: new Date() },
  });
  if (usuario.isBlocked) return errorJson("Esta cuenta está suspendida. Escribinos si creés que es un error.", 403);

  const res = NextResponse.json({ volver: link.volver ?? "/cuenta" });
  res.cookies.set(COOKIE_SESION, await crearValorSesion(usuario.id), OPCIONES_COOKIE);
  return res;
}
