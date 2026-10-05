import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, esDuplicado, leerJson } from "@/lib/api";
import { datosDeZona } from "../datos";

type Contexto = { params: Promise<{ id: string }> };

// Edita una zona.
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const r = datosDeZona(await leerJson(request));
  if (!r.ok) return errorJson(r.error);
  const datos = r.datos;

  const existe = await prisma.zone.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return errorJson("La zona no existe.", 404);

  try {
    const zona = await prisma.zone.update({ where: { id }, data: datos });
    refrescarSitio();
    return NextResponse.json(zona);
  } catch (e) {
    if (esDuplicado(e)) return errorJson("Ya existe una zona con esa dirección web (slug).", 409);
    console.error("Error editando zona:", e);
    return errorJson("No se pudo guardar la zona.", 500);
  }
}

// Borra una zona, solo si no tiene propiedades. Si tiene, hay que desactivarla.
export async function DELETE(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const zona = await prisma.zone.findUnique({ where: { id }, select: { _count: { select: { properties: true } } } });
  if (!zona) return errorJson("La zona no existe.", 404);
  if (zona._count.properties > 0) {
    return errorJson("Esta zona tiene propiedades cargadas. Desactivala en vez de borrarla.", 409);
  }

  await prisma.zone.delete({ where: { id } });
  refrescarSitio();
  return NextResponse.json({ ok: true });
}
