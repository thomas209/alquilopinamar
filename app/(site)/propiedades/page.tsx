import type { Metadata } from "next";
import PropiedadCard from "@/components/site/PropiedadCard";
import { Atenuable, Filtros, LimpiarFiltros, MarcoListado, VerMas } from "@/components/site/Listado";
import { etiquetaDe, TIPOS } from "@/lib/etiquetas";
import { leerBusqueda, OPERACIONES_URL, operacionDeUrl, tipoDeUrl, type Busqueda } from "@/lib/busqueda";
import { comodidadesActivas, listarPropiedades, zonasActivas, type Orden } from "@/lib/sitio";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// "Casas en alquiler temporario en Cariló"
function tituloDe(b: Busqueda, zonas: { slug: string; name: string }[]): string {
  const tipo = tipoDeUrl(b.tipo);
  const que = tipo ? etiquetaDe(TIPOS, tipo) + (tipo === "LOCAL" ? "es" : "s") : "Propiedades";
  const op = OPERACIONES_URL.find((o) => o.url === b.operacion);
  const zona = zonas.find((z) => z.slug === b.zona)?.name ?? "Pinamar y alrededores";
  const como = !op ? "" : op.valor === "VENTA" ? " en venta" : " en " + op.titulo.toLowerCase();
  return que + como + " en " + zona;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [b, zonas] = [leerBusqueda(await searchParams), await zonasActivas()];
  const titulo = tituloDe(b, zonas);
  return { title: titulo, description: titulo + ". Fotos, precios y consulta directa en AlquiloPinamar." };
}

export default async function PropiedadesPage({ searchParams }: Props) {
  const b = leerBusqueda(await searchParams);
  const [zonas, comodidades, { propiedades, total }] = await Promise.all([
    zonasActivas(),
    comodidadesActivas(),
    listarPropiedades({
      operacion: operacionDeUrl(b.operacion),
      zona: b.zona || undefined,
      tipo: tipoDeUrl(b.tipo),
      dormitorios: b.dorm ? Number(b.dorm) : undefined,
      pileta: b.pileta || undefined,
      mascotas: b.mascotas || undefined,
      orden: (b.orden || undefined) as Orden | undefined,
      moneda: b.moneda ? (b.moneda.toUpperCase() as "USD" | "ARS") : undefined,
      precioMin: b.pmin ? Number(b.pmin) : undefined,
      precioMax: b.pmax ? Number(b.pmax) : undefined,
      banos: b.banos ? Number(b.banos) : undefined,
      cochera: b.cochera || undefined,
      marHasta: b.mar ? Number(b.mar) : undefined,
      comodidades: b.com.length ? b.com : undefined,
      limite: b.ver,
    }),
  ]);

  return (
    <MarcoListado>
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-12 md:pt-10">
        <h1 className="font-titulo text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[40px]">{tituloDe(b, zonas)}</h1>
        <p className="mt-2 text-[14px] text-texto-2">{total === 1 ? "1 propiedad" : total.toLocaleString("es-AR") + " propiedades"}</p>
        <div className="mt-5">
          <Filtros busqueda={b} zonas={zonas} comodidades={comodidades} />
        </div>
      </div>

      <Atenuable>
        {propiedades.length === 0 ? (
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-12">
            <p className="font-titulo text-[22px] font-medium tracking-[-0.02em]">No hay propiedades con esos filtros.</p>
            <p className="mt-2 text-[15px] text-texto-2">Probá con otra zona o sacando algún filtro.</p>
            <LimpiarFiltros />
          </div>
        ) : (
          <div className="mx-auto mt-6 grid max-w-[1440px] grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 md:px-12 lg:grid-cols-3 2xl:grid-cols-4">
            {propiedades.map((p, i) => (
              <PropiedadCard key={p.id} p={p} aBorde prioridad={i < 2} className="animate-entrada" />
            ))}
          </div>
        )}
        <VerMas busqueda={b} mostradas={propiedades.length} total={total} />
      </Atenuable>
    </MarcoListado>
  );
}
