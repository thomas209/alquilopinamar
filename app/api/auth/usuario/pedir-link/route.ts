import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson, texto } from "@/lib/api";
import { hashDeIp } from "@/lib/consultas";
import { mandarLinkIngreso } from "@/lib/email";
import { SITE_URL } from "@/lib/seo";
import { DURACION_LINK_MIN, esMailValido, MAX_LINKS_POR_IP, MAX_LINKS_POR_MAIL, nuevoToken, rutaVolver } from "@/lib/usuarios";

const MINUTO = 60_000;

// Pide un link magico para entrar. La respuesta es la misma exista o no la
// cuenta: la cuenta se crea recien cuando se usa el link.
export async function POST(request: Request) {
  const body = await leerJson(request);

  // Campo trampa para robots: se responde como si estuviera todo bien
  if (typeof body.sitio === "string" && body.sitio.trim() !== "") return NextResponse.json({ ok: true });

  const email = texto(body.email, 120)?.toLowerCase() ?? "";
  if (!esMailValido(email)) return NextResponse.json({ error: "Revisá el mail: no parece válido.", campo: "email" }, { status: 400 });
  const volver = rutaVolver(body.volver);
  const ipHash = hashDeIp(request);

  const ahora = Date.now();
  const [porMail, porIp] = await Promise.all([
    prisma.loginToken.count({ where: { email, createdAt: { gte: new Date(ahora - DURACION_LINK_MIN * MINUTO) } } }),
    ipHash ? prisma.loginToken.count({ where: { ipHash, createdAt: { gte: new Date(ahora - 60 * MINUTO) } } }) : 0,
  ]);
  if (porMail >= MAX_LINKS_POR_MAIL || porIp >= MAX_LINKS_POR_IP) {
    return errorJson("Ya te mandamos varios links. Revisá tu mail (también en spam) o probá de nuevo en unos minutos.", 429);
  }

  // Cuenta bloqueada: misma respuesta, pero no se manda nada
  const bloqueado = await prisma.user.findFirst({ where: { email, isBlocked: true }, select: { id: true } });
  if (bloqueado) return NextResponse.json({ ok: true });

  const { token, hash } = nuevoToken();
  await prisma.loginToken.create({
    data: { email, tokenHash: hash, volver, ipHash, expiresAt: new Date(ahora + DURACION_LINK_MIN * MINUTO) },
  });

  const enviado = await mandarLinkIngreso(email, SITE_URL + "/cuenta/entrar?token=" + token, DURACION_LINK_MIN);

  // Limpieza: los pedidos de mas de una semana ya no sirven ni para el limite
  after(() => prisma.loginToken.deleteMany({ where: { createdAt: { lt: new Date(ahora - 7 * 24 * 60 * MINUTO) } } }).catch(() => {}));

  if (!enviado) return errorJson("No pudimos mandarte el mail. Probá de nuevo en un rato.", 502);
  return NextResponse.json({ ok: true });
}
