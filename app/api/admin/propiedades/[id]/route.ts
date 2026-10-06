import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson } from "@/lib/api";
import { armarSlug, datosDePropiedad, faltaParaPublicar, mensajeFalta } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string }> };

// Edita una propiedad (datos, amenities y tarifas). El estado se cambia en /estado.
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const actual = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, code: true, status: true, publishedAt: true, _count: { select: { images: true } } },
  });
  if (!actual) return errorJson("La propiedad no existe.", 404);

  const r = datosDePropiedad(await leerJson(request));
  if (!r.ok) return errorJson(r.error);

  const zona = await prisma.zone.findUnique({ where: { id: r.datos.zoneId }, select: { id: true } });
  if (!zona) return errorJson("La zona elegida no existe.");

  // Una publicada no puede quedar incompleta: primero hay que pausarla
  if (actual.status === "PUBLICADA") {
    const falta = faltaParaPublicar({ ...r.datos, fotos: actual._count.images });
    if (falta.length) return errorJson("Está publicada y con estos cambios quedaría incompleta. " + mensajeFalta(falta) + " Pausala antes de guardar así.");
  }

  const amenities = await prisma.amenity.findMany({ where: { id: { in: r.amenityIds } }, select: { id: true } });

  try {
    const propiedad = await prisma.$transaction(async (tx) => {
      await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
      await tx.propertyRate.deleteMany({ where: { propertyId: id } });
      return tx.property.update({
        where: { id },
        data: {
          ...r.datos,
          // El link no cambia una vez que la propiedad se publico alguna vez
          ...(actual.publishedAt ? {} : { slug: armarSlug(r.datos.title, actual.code) }),
          amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
          rates: { create: r.tarifas.map((t, i) => ({ ...t, sortOrder: i })) },
        },
        select: { id: true, code: true, slug: true },
      });
    });
    refrescarSitio();
    return NextResponse.json(propiedad);
  } catch (e) {
    console.error("Error editando propiedad:", e);
    return errorJson("No se pudo guardar la propiedad.", 500);
  }
}

// Da de baja una propiedad. Es una baja logica: no se pierden sus consultas.
export async function DELETE(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const actual = await prisma.property.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (!actual) return errorJson("La propiedad no existe.", 404);

  await prisma.property.update({ where: { id }, data: { deletedAt: new Date(), status: "PAUSADA", isFeatured: false } });
  refrescarSitio();
  return NextResponse.json({ ok: true });
}
