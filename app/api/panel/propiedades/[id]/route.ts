import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson } from "@/lib/api";
import { datosDelPropietario, propiedadPropia } from "@/lib/panel";
import { armarSlug, faltaParaPublicar, mensajeFalta } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string }> };

// El propietario edita su propiedad (datos, comodidades y tarifas).
// - Publicada: los cambios salen al instante. Si cambia el titulo o la descripcion,
//   queda marcada para que el admin la revise despues (no se baja).
// - Rechazada: al editarla vuelve a borrador, para corregirla y reenviarla.
export async function PATCH(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  const actual = permiso.propiedad;

  const r = datosDelPropietario(await leerJson(request));
  if (!r.ok) return errorJson(r.error);

  const zona = await prisma.zone.findUnique({ where: { id: r.datos.zoneId }, select: { id: true } });
  if (!zona) return errorJson("Elegí una zona de la lista.");

  const publicada = actual.status === "PUBLICADA";
  if (publicada) {
    const fotos = await prisma.propertyImage.count({ where: { propertyId: id } });
    const falta = faltaParaPublicar({ ...r.datos, fotos });
    if (falta.length) return errorJson("Está publicada y con estos cambios quedaría incompleta. " + mensajeFalta(falta) + " Pausala antes de guardar así.");
  }
  const cambioTexto = actual.title !== r.datos.title || actual.description !== r.datos.description;

  const amenities = await prisma.amenity.findMany({ where: { id: { in: r.amenityIds } }, select: { id: true } });

  try {
    const propiedad = await prisma.$transaction(async (tx) => {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      await tx.propertyRate.deleteMany({ where: { propertyId: id } });
      return tx.property.update({
        where: { id },
        data: {
          ...r.datos,
          ...(actual.publishedAt ? {} : { slug: armarSlug(r.datos.title, actual.code) }),
          ...(actual.status === "RECHAZADA" ? { status: "BORRADOR" as const } : {}),
          ...(publicada && cambioTexto ? { needsReview: true } : {}),
          amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
          rates: { create: r.tarifas.map((t, i) => ({ ...t, sortOrder: i })) },
        },
        select: { id: true, code: true, slug: true, status: true },
      });
    });
    if (publicada) refrescarSitio();
    return NextResponse.json(propiedad);
  } catch (e) {
    console.error("Error editando propiedad del panel:", e);
    return errorJson("No se pudo guardar la propiedad.", 500);
  }
}

// El propietario la elimina. Es una baja logica: las consultas no se pierden.
export async function DELETE(_request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;

  await prisma.property.update({ where: { id }, data: { deletedAt: new Date(), status: "PAUSADA", isFeatured: false } });
  if (permiso.propiedad.status === "PUBLICADA") refrescarSitio();
  return NextResponse.json({ ok: true });
}
