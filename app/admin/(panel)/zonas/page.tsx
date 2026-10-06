import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ZonasAdmin from "@/components/admin/ZonasAdmin";

export const metadata: Metadata = { title: "Zonas" };

export default async function AdminZonasPage() {
  const zonas = await prisma.zone.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { properties: true } } },
  });

  return (
    <ZonasAdmin
      zonas={zonas.map((z) => ({
        id: z.id,
        name: z.name,
        slug: z.slug,
        description: z.description ?? "",
        seoTitle: z.seoTitle ?? "",
        seoDescription: z.seoDescription ?? "",
        sortOrder: z.sortOrder,
        isActive: z.isActive,
        propiedades: z._count.properties,
      }))}
    />
  );
}
