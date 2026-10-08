import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PropiedadForm from "@/components/admin/PropiedadForm";

export const metadata: Metadata = { title: "Nueva propiedad" };

export default async function AdminPropiedadNuevaPage() {
  const [zonas, amenities] = await Promise.all([
    prisma.zone.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true, slug: true } }),
    prisma.amenity.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  return <PropiedadForm zonas={zonas} amenities={amenities} propiedad={null} />;
}
