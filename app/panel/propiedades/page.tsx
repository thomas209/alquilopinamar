import type { Metadata } from "next";
import Link from "next/link";
import DisponibilidadRapida from "@/components/panel/DisponibilidadRapida";
import Foto from "@/components/site/Foto";
import Boton from "@/components/ui/Boton";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { prisma } from "@/lib/prisma";
import { etiquetaDe, OPERACIONES, TIPOS } from "@/lib/etiquetas";
import { formatearCodigo } from "@/lib/formato";
import { usuarioActual } from "@/lib/usuarios";

export const metadata: Metadata = { title: "Mis propiedades" };

// Como lo ve el propietario
const ESTADO = {
  BORRADOR: { texto: "Borrador", tono: "neutro", nota: "Todavía no la enviaste. Seguí cuando quieras." },
  EN_REVISION: { texto: "En revisión", tono: "negro", nota: "La estamos revisando. Cuando la aprobemos sale publicada." },
  PUBLICADA: { texto: "Publicada", tono: "ok", nota: null },
  PAUSADA: { texto: "Pausada", tono: "neutro", nota: "No se ve en el sitio hasta que la reanudes." },
  RECHAZADA: { texto: "Para corregir", tono: "error", nota: null },
} as const;

export default async function MisPropiedadesPage() {
  const yo = await usuarioActual();
  if (!yo) return null; // el layout ya redirige

  const propiedades = await prisma.property.findMany({
    where: { ownerId: yo.id, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      code: true,
      slug: true,
      title: true,
      status: true,
      operation: true,
      type: true,
      rejectionReason: true,
      needsReview: true,
      zone: { select: { name: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
      rates: { orderBy: { sortOrder: "asc" }, select: { label: true, startDate: true, endDate: true } },
      blocks: { orderBy: { startDate: "asc" }, select: { startDate: true, endDate: true } },
    },
  });
  const dia = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-16 md:px-12 md:pt-12">
      <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <Rotulo como="p">Panel</Rotulo>
          <h1 className="mt-4 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[48px]">Mis propiedades</h1>
        </div>
        {propiedades.length > 0 && (
          <Boton href="/panel/propiedades/nueva" className="self-start md:self-auto">
            Publicar una propiedad
          </Boton>
        )}
      </header>

      {propiedades.length === 0 ? (
        <section className="mt-10 max-w-[640px] rounded-card bg-gris-50 px-6 py-10 md:px-10">
          <h2 className="font-titulo text-[24px] leading-tight font-semibold tracking-[-0.02em]">Publicá tu propiedad gratis</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-texto-2">
            Te guiamos paso a paso: qué es, cómo es, dónde está, fotos y precio. Se guarda sola, así que podés seguir en otro momento. Antes de salir publicada la revisamos.
          </p>
          <Boton href="/panel/propiedades/nueva" className="mt-7">
            Empezar
          </Boton>
        </section>
      ) : (
        <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((p) => {
            const e = ESTADO[p.status];
            const foto = p.images[0]?.url;
            return (
              <li key={p.id} className="flex flex-col">
                <Link href={"/panel/propiedades/" + p.id} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-gris-100">
                    {foto ? (
                      <Foto url={foto} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" recorte="4:3" anchos={[480, 800]} className="size-full object-cover transition-transform duration-[450ms] ease-app group-hover:scale-[1.02]" />
                    ) : (
                      <div className="grid size-full place-items-center text-[14px] text-texto-2">Sin fotos todavía</div>
                    )}
                    <PastillaEstado tono={e.tono} className="absolute top-3 left-3">
                      {e.texto}
                    </PastillaEstado>
                  </div>
                  <Rotulo como="p" className="mt-4">
                    {formatearCodigo(p.code)} · {etiquetaDe(TIPOS, p.type)} · {p.zone.name}
                  </Rotulo>
                  <p className="mt-2 truncate font-titulo text-[18px] font-medium tracking-[-0.01em]">{p.title}</p>
                  <p className="mt-1 text-[14px] text-texto-2">{etiquetaDe(OPERACIONES, p.operation)}</p>
                </Link>
                {p.status === "RECHAZADA" && (
                  <p className="mt-3 rounded-campo bg-error/5 px-4 py-3 text-[14px] leading-relaxed text-error">
                    {p.rejectionReason ? "Para publicarla: " + p.rejectionReason : "Revisá los datos y volvé a enviarla."}
                  </p>
                )}
                {e.nota && <p className="mt-3 text-[14px] text-texto-2">{e.nota}</p>}
                {p.status === "PUBLICADA" && p.needsReview && <p className="mt-3 text-[14px] text-texto-2">Tus últimos cambios ya se ven. Los vamos a revisar.</p>}
                <div className="mt-4 flex gap-5">
                  <Link href={"/panel/propiedades/" + p.id} className="text-[15px] font-medium text-link hover:opacity-70">
                    {p.status === "BORRADOR" ? "Continuar" : "Editar"}
                  </Link>
                  {p.operation === "ALQUILER_TEMPORARIO" && (
                    <DisponibilidadRapida
                      propiedadId={p.id}
                      titulo={p.title}
                      ocupados={p.blocks.map((b) => ({ desde: dia(b.startDate), hasta: dia(b.endDate) }))}
                      periodos={p.rates.flatMap((t) => (t.startDate && t.endDate ? [{ label: t.label, startDate: dia(t.startDate), endDate: dia(t.endDate) }] : []))}
                    />
                  )}
                  {p.status === "PUBLICADA" && (
                    <Link href={"/propiedad/" + p.slug} className="text-[15px] font-medium text-link hover:opacity-70">
                      Ver publicación
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
