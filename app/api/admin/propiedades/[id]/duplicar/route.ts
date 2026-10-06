import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { errorJson } from "@/lib/api";
import { armarSlug } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string }> };

// Crea una copia en borrador (para publicar la misma casa con otra operacion, por ejemplo).
// Las fotos no se copian: se cargan de nuevo en la copia.
export async function POST(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const origen = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { amenities: true, rates: { orderBy: { sortOrder: "asc" } } },
  });
  if (!origen) return errorJson("La propiedad no existe.", 404);

  try {
    const copia = await prisma.$transaction(async (tx) => {
      const creada = await tx.property.create({
        data: {
          slug: "tmp-" + randomUUID(),
          title: origen.title,
          description: origen.description,
          operation: origen.operation,
          type: origen.type,
          zoneId: origen.zoneId,
          address: origen.address,
          lat: origen.lat,
          lng: origen.lng,
          showExactLocation: origen.showExactLocation,
          distanceToSeaM: origen.distanceToSeaM,
          rooms: origen.rooms,
          bedrooms: origen.bedrooms,
          bathrooms: origen.bathrooms,
          garages: origen.garages,
          maxGuests: origen.maxGuests,
          coveredM2: origen.coveredM2,
          lotM2: origen.lotM2,
          hasPool: origen.hasPool,
          petsAllowed: origen.petsAllowed,
          price: origen.price,
          currency: origen.currency,
          pricePeriod: origen.pricePeriod,
          priceOnRequest: origen.priceOnRequest,
          expenses: origen.expenses,
          houseRules: origen.houseRules,
          checkInTime: origen.checkInTime,
          checkOutTime: origen.checkOutTime,
          minNights: origen.minNights,
          contactWhatsapp: origen.contactWhatsapp,
          amenities: { create: origen.amenities.map((a) => ({ amenityId: a.amenityId })) },
          rates: {
            create: origen.rates.map((t) => ({
              label: t.label,
              period: t.period,
              amount: t.amount,
              currency: t.currency,
              startDate: t.startDate,
              endDate: t.endDate,
              minNights: t.minNights,
              sortOrder: t.sortOrder,
            })),
          },
        },
      });
      return tx.property.update({
        where: { id: creada.id },
        data: { slug: armarSlug(creada.title, creada.code) },
        select: { id: true, code: true },
      });
    });
    return NextResponse.json(copia, { status: 201 });
  } catch (e) {
    console.error("Error duplicando propiedad:", e);
    return errorJson("No se pudo duplicar la propiedad.", 500);
  }
}
