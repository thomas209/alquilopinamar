import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson } from "@/lib/api";
import { armarSlug, datosDePropiedad } from "@/lib/propiedad";

// Crea una propiedad. Siempre nace como borrador.
export async function POST(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;

  const r = datosDePropiedad(await leerJson(request));
  if (!r.ok) return errorJson(r.error);

  const zona = await prisma.zone.findUnique({ where: { id: r.datos.zoneId }, select: { id: true } });
  if (!zona) return errorJson("La zona elegida no existe.");

  const amenities = await prisma.amenity.findMany({ where: { id: { in: r.amenityIds } }, select: { id: true } });

  try {
    const propiedad = await prisma.$transaction(async (tx) => {
      // El slug lleva el codigo, que recien se conoce despues de crearla
      const creada = await tx.property.create({
        data: {
          ...r.datos,
          slug: "tmp-" + randomUUID(),
          amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
          rates: { create: r.tarifas.map((t, i) => ({ ...t, sortOrder: i })) },
        },
      });
      return tx.property.update({
        where: { id: creada.id },
        data: { slug: armarSlug(creada.title, creada.code) },
        select: { id: true, code: true, slug: true },
      });
    });
    refrescarSitio();
    return NextResponse.json(propiedad, { status: 201 });
  } catch (e) {
    console.error("Error creando propiedad:", e);
    return errorJson("No se pudo guardar la propiedad.", 500);
  }
}
