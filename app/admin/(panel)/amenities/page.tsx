import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AmenitiesAdmin from "@/components/admin/AmenitiesAdmin";

export const metadata: Metadata = { title: "Amenities" };

export default async function AdminAmenitiesPage() {
  const amenities = await prisma.amenity.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { properties: true } } },
  });

  return (
    <AmenitiesAdmin
      amenities={amenities.map((a) => ({
        id: a.id,
        name: a.name,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
        propiedades: a._count.properties,
      }))}
    />
  );
}
