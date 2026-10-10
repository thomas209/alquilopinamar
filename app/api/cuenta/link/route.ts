import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson, texto } from "@/lib/api";
import { hashDeIp } from "@/lib/consultas";
import { mandarLinkIngreso } from "@/lib/email";
import { hashToken, MAIL, MINUTOS_LINK, nuevoToken, rutaVolver } from "@/lib/usuarios";
import { SITE_URL } from "@/lib/seo";

const MINUTO = 60_000;

// Pide un link para entrar. La respuesta es la misma exista o no la cuenta
// (la cuenta se crea recien cuando se usa el link).
export async function POST(request: Request) {
  const body = await leerJson(request);
  // Campo trampa: las personas no lo ven; si viene lleno es un robot
  if (texto(body.sitio)) return NextResponse.json({ ok: true });

  const email = texto(body.email, 120)?.toLowerCase() ?? null;
  if (!email || !MAIL.test(email)) return errorJson("Revisá el mail: no parece válido.");
  const volver = rutaVolver(body.volver);
  const ipHash = hashDeIp(request);
  const ahora = Date.now();

  // Limites anti-abuso: 3 links cada 15 min por mail y 10 por hora por conexion
  const [porMail, porIp] = await Promise.all([
    prisma.loginLink.count({ where: { email, createdAt: { gte: new Date(ahora - 15 * MINUTO) } } }),
    ipHash ? prisma.loginLink.count({ where: { ipHash, createdAt: { gte: new Date(ahora - 60 * MINUTO) } } }) : 0,
  ]);
  if (porMail >= 3 || porIp >= 10) return errorJson("Pediste varios links seguidos. Esperá unos minutos y probá de nuevo.", 429);

  const token = nuevoToken();
  await prisma.$transaction([
    // Limpieza: links de hace mas de un dia ya no sirven ni para el limite
    prisma.loginLink.deleteMany({ where: { createdAt: { lt: new Date(ahora - 24 * 60 * MINUTO) } } }),
    prisma.loginLink.create({
      data: { email, tokenHash: hashToken(token), volver, ipHash, expiresAt: new Date(ahora + MINUTOS_LINK * MINUTO) },
    }),
  ]);

  const url = SITE_URL + "/ingresar/confirmar?t=" + token;
  const r = await mandarLinkIngreso(email, url, MINUTOS_LINK);
  if (r !== "enviado") return errorJson("No pudimos mandarte el mail. Probá de nuevo en un rato.", 503);
  // Solo en la compu de desarrollo y sin Resend: el link vuelve en la respuesta para probar
  const prueba = process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY ? { linkPrueba: url } : {};
  return NextResponse.json({ ok: true, ...prueba });
}
