import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PropiedadForm from "@/components/admin/PropiedadForm";
import { faltaParaPublicar, MIN_FOTOS, MIN_FOTOS_LOTE } from "@/lib/propiedad";

export const metadata: Metadata = { title: "Editar propiedad" };

const dia = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");
const num = (n: number | null) => (n === null ? "" : String(n));

export default async function AdminPropiedadEditarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const p = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: {
      amenities: { select: { amenityId: true } },
      rates: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } },
    },
  });
  if (!p) notFound();

  const usados = p.amenities.map((a) => a.amenityId);
  const [zonas, amenities] = await Promise.all([
    // Activas, mas la que ya tiene la propiedad aunque este desactivada
    prisma.zone.findMany({
      where: { OR: [{ isActive: true }, { id: p.zoneId }] },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
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
        valores: {
          title: p.title,
          description: p.description,
          operation: p.operation,
          type: p.type,
          zoneId: p.zoneId,
          address: p.address ?? "",
          lat: num(p.lat),
          lng: num(p.lng),
          showExactLocation: p.showExactLocation,
          distanceToSeaM: num(p.distanceToSeaM),
          rooms: num(p.rooms),
          bedrooms: num(p.bedrooms),
          bathrooms: num(p.bathrooms),
          garages: num(p.garages),
          maxGuests: num(p.maxGuests),
          coveredM2: num(p.coveredM2),
          lotM2: num(p.lotM2),
          hasPool: p.hasPool,
          petsAllowed: p.petsAllowed,
          price: p.price === null ? "" : String(Number(p.price)),
          currency: p.currency,
          pricePeriod: p.pricePeriod,
          priceOnRequest: p.priceOnRequest,
          expenses: p.expenses === null ? "" : String(Number(p.expenses)),
          houseRules: p.houseRules ?? "",
          checkInTime: p.checkInTime ?? "",
          checkOutTime: p.checkOutTime ?? "",
          minNights: num(p.minNights),
          contactWhatsapp: p.contactWhatsapp ?? "",
          isFeatured: p.isFeatured,
          featuredOrder: num(p.featuredOrder),
          amenityIds: usados,
          rates: p.rates.map((t) => ({
            label: t.label,
            period: t.period,
            amount: String(Number(t.amount)),
            currency: t.currency,
            startDate: dia(t.startDate),
            endDate: dia(t.endDate),
          })),
        },
      }}
    />
  );
}
