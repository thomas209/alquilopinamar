import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson } from "@/lib/api";
import { faltaEnLaCuenta, propiedadPropia } from "@/lib/panel";
import { faltaParaPublicar, mensajeFalta } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string }> };

// Lo que el propietario puede hacer con el estado (docs/06-business-rules.md → Estados):
// - enviar:   borrador o rechazada → en revision (la publica el admin)
// - retirar:  en revision → borrador
// - pausar:   publicada → pausada
// - reanudar: pausada → publicada (solo si ya fue aprobada antes)
export async function POST(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  const { yo, propiedad } = permiso;

  const accion = (await leerJson(request)).accion;
  const p = await prisma.property.findUniqueOrThrow({ where: { id }, include: { _count: { select: { images: true } } } });
  const falta = () => faltaParaPublicar({ ...p, fotos: p._count.images });

  if (accion === "enviar") {
    if (propiedad.status !== "BORRADOR" && propiedad.status !== "RECHAZADA") return errorJson("Esta propiedad no se puede enviar a revisión ahora.");
    const enPropiedad = falta();
    if (enPropiedad.length) return errorJson(mensajeFalta(enPropiedad));
    const enCuenta = faltaEnLaCuenta(yo);
    if (enCuenta.length) return errorJson("Para enviarla completá en tu cuenta " + enCuenta.join(" y ") + ".");
    await prisma.property.update({ where: { id }, data: { status: "EN_REVISION", submittedAt: new Date(), rejectionReason: null } });
    return NextResponse.json({ ok: true, status: "EN_REVISION" });
  }

  if (accion === "retirar") {
    if (propiedad.status !== "EN_REVISION") return errorJson("Esta propiedad no está en revisión.");
    await prisma.property.update({ where: { id }, data: { status: "BORRADOR" } });
    return NextResponse.json({ ok: true, status: "BORRADOR" });
  }

  if (accion === "pausar") {
    if (propiedad.status !== "PUBLICADA") return errorJson("Solo se puede pausar una propiedad publicada.");
    await prisma.property.update({ where: { id }, data: { status: "PAUSADA" } });
    refrescarSitio();
    return NextResponse.json({ ok: true, status: "PAUSADA" });
  }

  if (accion === "reanudar") {
    if (propiedad.status !== "PAUSADA") return errorJson("Esta propiedad no está pausada.");
    if (!propiedad.publishedAt) return errorJson("Todavía no fue aprobada: enviala a revisión.");
    const f = falta();
    if (f.length) return errorJson(mensajeFalta(f));
    await prisma.property.update({ where: { id }, data: { status: "PUBLICADA" } });
    refrescarSitio();
    return NextResponse.json({ ok: true, status: "PUBLICADA" });
  }

  return errorJson("Acción no válida.");
}
