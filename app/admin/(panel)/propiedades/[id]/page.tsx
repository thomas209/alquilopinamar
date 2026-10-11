import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropiedadForm from "@/components/admin/PropiedadForm";
import { faltaParaPublicar, MIN_FOTOS, MIN_FOTOS_LOTE } from "@/lib/propiedad";
import { valoresDesdeBase } from "@/lib/valores-propiedad";

export const metadata: Metadata = { title: "Editar propiedad" };


export default async function AdminPropiedadEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const p = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      amenities: { select: { amenityId: true } },
      rates: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } },
      owner: { select: { firstName: true, lastName: true, email: true, phone: true, whatsapp: true } },
    },
  });
  if (!p) notFound();

  const usados = p.amenities.map((a) => a.amenityId);
  const [zonas, amenities] = await Promise.all([
    // Activas, mas la que ya tiene la propiedad aunque este desactivada
    prisma.zone.findMany({
      where: { OR: [{ isActive: true }, { id: p.zoneId }] },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.amenity.findMany({
      where: { OR: [{ isActive: true }, { id: { in: usados } }] },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return (
    <PropiedadForm
      zonas={zonas}
      amenities={amenities}
      propiedad={{
        id: p.id,
        code: p.code,
        slug: p.slug,
        status: p.status,
        fotos: p.images.length,
        imagenes: p.images,
        minimoFotos: p.type === "LOTE" ? MIN_FOTOS_LOTE : MIN_FOTOS,
        falta: faltaParaPublicar({ ...p, fotos: p.images.length }),
        valores: valoresDesdeBase(p),
        needsReview: p.needsReview,
        propietario: p.owner
          ? { nombre: (p.owner.firstName + " " + p.owner.lastName).trim(), email: p.owner.email, telefono: p.owner.whatsapp || p.owner.phone }
          : null,
      }}
    />
  );
}
