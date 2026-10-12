import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Asistente from "@/components/panel/Asistente";
import { prisma } from "@/lib/prisma";
import { faltaEnLaCuenta } from "@/lib/panel";
import { opcionesDelAsistente } from "@/lib/panel-datos";
import { minimoDeFotos } from "@/lib/requisitos";
import { usuarioActual } from "@/lib/usuarios";
import { valoresDesdeBase } from "@/lib/valores-propiedad";

export const metadata: Metadata = { title: "Editar propiedad" };

export default async function EditarPropiedadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ id }, sp, yo] = await Promise.all([params, searchParams, usuarioActual()]);
  if (!yo) return null; // el layout ya redirige

  // Solo las propias. Si no es suya, no existe.
  const p = await prisma.property.findFirst({
    where: { id, ownerId: yo.id, deletedAt: null },
    include: {
      amenities: { select: { amenityId: true } },
      rates: { orderBy: { sortOrder: "asc" } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true } },
    },
  });
  if (!p) notFound();

  const valores = valoresDesdeBase(p);
  const [zonas, amenities] = await opcionesDelAsistente({ zoneId: p.zoneId, amenityIds: valores.amenityIds });
  // ?paso=N (1 a 9). Sin paso: un borrador sin fotos suficientes abre en Fotos; el resto, en la revision.
  const pedido = Number(typeof sp.paso === "string" ? sp.paso : NaN);
  const sinFotos = p.status === "BORRADOR" && p.images.length < minimoDeFotos(p.type);
  const paso = Number.isInteger(pedido) && pedido >= 1 ? pedido - 1 : sinFotos ? 4 : 8;

  return (
    <Asistente
      key={p.id + p.status}
      zonas={zonas}
      amenities={amenities}
      propiedad={{
        id: p.id,
        code: p.code,
        slug: p.slug,
        status: p.status,
        rejectionReason: p.rejectionReason,
        needsReview: p.needsReview,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
        imagenes: p.images,
        valores,
      }}
      pasoInicial={paso}
      faltaCuenta={faltaEnLaCuenta(yo)}
      inicial={valores}
    />
  );
}
