// Datos que necesitan las pantallas del asistente del panel.
import { prisma } from "@/lib/prisma";

// Zonas y comodidades activas, mas las que ya tenga la propiedad aunque esten desactivadas.
export async function opcionesDelAsistente(actual?: { zoneId: string; amenityIds: string[] }) {
  return Promise.all([
    prisma.zone.findMany({
      where: actual ? { OR: [{ isActive: true }, { id: actual.zoneId }] } : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
    prisma.amenity.findMany({
      where: actual ? { OR: [{ isActive: true }, { id: { in: actual.amenityIds } }] } : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);
}
