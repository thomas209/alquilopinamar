import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Rotulo from "@/components/ui/Rotulo";

export const metadata: Metadata = { title: "Inicio" };

export default async function AdminInicioPage() {
  const [publicadas, borradores, consultasNuevas, zonas, amenities] = await Promise.all([
    prisma.property.count({ where: { status: "PUBLICADA", deletedAt: null } }),
    prisma.property.count({ where: { status: "BORRADOR", deletedAt: null } }),
    prisma.inquiry.count({ where: { status: "NUEVA" } }),
    prisma.zone.count({ where: { isActive: true } }),
    prisma.amenity.count({ where: { isActive: true } }),
  ]);

  const numeros = [
    { etiqueta: "Propiedades publicadas", valor: publicadas, href: "/admin/propiedades?estado=PUBLICADA" },
    { etiqueta: "Borradores", valor: borradores, href: "/admin/propiedades?estado=BORRADOR" },
    { etiqueta: "Consultas sin responder", valor: consultasNuevas, href: undefined },
    { etiqueta: "Zonas activas", valor: zonas, href: "/admin/zonas" },
    { etiqueta: "Amenities activos", valor: amenities, href: "/admin/amenities" },
  ];

  return (
    <>
      <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Inicio</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {numeros.map((n) => {
          const contenido = (
            <Card className="h-full">
              <Rotulo como="p" className="leading-snug">
                {n.etiqueta}
              </Rotulo>
              <p className="mt-3 font-titulo text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{n.valor}</p>
            </Card>
          );
          return n.href ? (
            <Link key={n.etiqueta} href={n.href} className="transition-transform duration-200 ease-app active:scale-[0.97]">
              {contenido}
            </Link>
          ) : (
            <div key={n.etiqueta}>{contenido}</div>
          );
        })}
      </div>
      <p className="mt-8 max-w-[52ch] text-[14px] text-texto-2">
        Las fotos de las propiedades y la bandeja de consultas se suman en los próximos pasos.
      </p>
    </>
  );
}
