// Fechas ocupadas de una propiedad: guardar la lista completa (panel y admin).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refrescarSitio } from "@/lib/cache";
import { errorJson } from "@/lib/api";
import { hoyArgentina, rangosValidos, type Rango } from "@/lib/disponibilidad";

const dia = (iso: string) => new Date(iso + "T00:00:00.000Z");
const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function ocupadosDe(propertyId: string): Promise<Rango[]> {
  const bloques = await prisma.availabilityBlock.findMany({ where: { propertyId }, orderBy: { startDate: "asc" }, select: { startDate: true, endDate: true } });
  return bloques.map((b) => ({ desde: iso(b.startDate), hasta: iso(b.endDate) }));
}

// Reemplaza todas las fechas ocupadas por las que llegan (ya ordenadas y juntadas).
export async function guardarOcupados(propertyId: string, body: Record<string, unknown>, publicada: boolean) {
  const r = rangosValidos(body.rangos, hoyArgentina());
  if (!r.ok) return errorJson(r.error);
  await prisma.$transaction([
    prisma.availabilityBlock.deleteMany({ where: { propertyId } }),
    prisma.availabilityBlock.createMany({ data: r.rangos.map((x) => ({ propertyId, startDate: dia(x.desde), endDate: dia(x.hasta) })) }),
    prisma.property.update({ where: { id: propertyId }, data: { availabilityUpdatedAt: new Date() } }),
  ]);
  if (publicada) refrescarSitio();
  return NextResponse.json({ rangos: r.rangos });
}
