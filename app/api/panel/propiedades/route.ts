import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson } from "@/lib/api";
import { datosDelPropietario, MAX_PROPIEDADES_POR_USUARIO } from "@/lib/panel";
import { armarSlug } from "@/lib/propiedad";
import { usuarioActual } from "@/lib/usuarios";

// El propietario crea una propiedad. Nace como borrador y es suya.
export async function POST(request: Request) {
  const yo = await usuarioActual();
  if (!yo) return errorJson("Tu sesión se cerró. Volvé a entrar.", 401);

  const cuantas = await prisma.property.count({ where: { ownerId: yo.id, deletedAt: null } });
  if (cuantas >= MAX_PROPIEDADES_POR_USUARIO) return errorJson("Llegaste al máximo de propiedades por cuenta. Escribinos si necesitás más.", 403);

  const r = datosDelPropietario(await leerJson(request));
  if (!r.ok) return errorJson(r.error);

  const zona = await prisma.zone.findFirst({ where: { id: r.datos.zoneId, isActive: true }, select: { id: true } });
  if (!zona) return errorJson("Elegí una zona de la lista.");
  const amenities = await prisma.amenity.findMany({ where: { id: { in: r.amenityIds }, isActive: true }, select: { id: true } });

  try {
    const propiedad = await prisma.$transaction(async (tx) => {
      const creada = await tx.property.create({
        data: {
          ...r.datos,
          status: "BORRADOR",
          ownerId: yo.id,
          slug: "tmp-" + randomUUID(),
          amenities: { create: amenities.map((a) => ({ amenityId: a.id })) },
          rates: { create: r.tarifas.map((t, i) => ({ ...t, sortOrder: i })) },
        },
      });
      if (!yo.isHost) await tx.user.update({ where: { id: yo.id }, data: { isHost: true } });
      return tx.property.update({
        where: { id: creada.id },
        data: { slug: armarSlug(creada.title, creada.code) },
        select: { id: true, code: true, slug: true },
      });
    });
    return NextResponse.json(propiedad, { status: 201 });
  } catch (e) {
    console.error("Error creando propiedad del panel:", e);
    return errorJson("No se pudo guardar la propiedad.", 500);
  }
}
