import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, esDuplicado, leerJson } from "@/lib/api";
import { datosDeAmenity } from "../datos";

type Contexto = { params: Promise<{ id: string }> };

// Edita un amenity.
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const r = datosDeAmenity(await leerJson(request));
  if (!r.ok) return errorJson(r.error);
  const datos = r.datos;

  const existe = await prisma.amenity.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return errorJson("El amenity no existe.", 404);

  try {
    const amenity = await prisma.amenity.update({ where: { id }, data: datos });
    refrescarSitio();
    return NextResponse.json(amenity);
  } catch (e) {
    if (esDuplicado(e)) return errorJson("Ya existe un amenity con ese nombre.", 409);
    console.error("Error editando amenity:", e);
    return errorJson("No se pudo guardar el amenity.", 500);
  }
}

// Borra un amenity, solo si ninguna propiedad lo usa. Si lo usan, hay que desactivarlo.
export async function DELETE(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const amenity = await prisma.amenity.findUnique({ where: { id }, select: { _count: { select: { properties: true } } } });
  if (!amenity) return errorJson("El amenity no existe.", 404);
  if (amenity._count.properties > 0) {
    return errorJson("Hay propiedades que usan este amenity. Desactivalo en vez de borrarlo.", 409);
  }

  await prisma.amenity.delete({ where: { id } });
  refrescarSitio();
  return NextResponse.json({ ok: true });
}
