import type { Metadata } from "next";
import PropiedadCard from "@/components/site/PropiedadCard";
import { Atenuable, CambiarVista, Filtros, LimpiarFiltros, MarcoListado, VerMas } from "@/components/site/Listado";
import VistaMapa from "@/components/site/VistaMapa";
import { etiquetaDe, TIPOS } from "@/lib/etiquetas";
import { leerBusqueda, OPERACIONES_URL, operacionDeUrl, tipoDeUrl, urlDeBusqueda, type Busqueda } from "@/lib/busqueda";
import { metadataDePagina } from "@/lib/seo";
import { comodidadesActivas, listarPropiedades, puntosDelMapa, zonasActivas, type FiltrosListado, type Orden } from "@/lib/sitio";

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

// Solo se indexan los listados por operacion, zona y tipo. Con cualquier otro
// filtro (precio, comodidades, orden, "Ver más"...) la pagina no se indexa y su
// canonica es la version sin esos filtros: evita miles de paginas casi iguales.
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const [b, zonas] = [leerBusqueda(sp), await zonasActivas()];
  const titulo = tituloDe(b, zonas);
  const canonica = urlDeBusqueda({ operacion: b.operacion, zona: b.zona, tipo: b.tipo });
  const conFiltrosFinos = Object.keys(sp).some((k) => !["operacion", "zona", "tipo"].includes(k));
  return metadataDePagina({
    titulo,
    descripcion: titulo + ": casas, departamentos y más con fotos reales, precios claros y consulta directa con el dueño o la inmobiliaria.",
    ruta: canonica,
    noIndexar: conFiltrosFinos,
  });
}

function filtrosDe(b: Busqueda): FiltrosListado {
  return {
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
  };
}

export default async function PropiedadesPage({ searchParams }: Props) {
  const b = leerBusqueda(await searchParams);
  const enMapa = b.vista === "mapa";
  const [zonas, comodidades, lista, mapa] = await Promise.all([
    zonasActivas(),
    comodidadesActivas(),
    enMapa ? null : listarPropiedades(filtrosDe(b)),
    enMapa ? puntosDelMapa({ ...filtrosDe(b), limite: undefined }) : null,
  ]);
  const total = lista ? lista.total : mapa!.puntos.length + mapa!.sinUbicacion;

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
        {mapa ? (
          <VistaMapa puntos={mapa.puntos} sinUbicacion={mapa.sinUbicacion} />
        ) : lista!.propiedades.length === 0 ? (
          <div className="mx-auto max-w-[1440px] px-4 py-20 md:px-12">
            <p className="font-titulo text-[22px] font-medium tracking-[-0.02em]">No hay propiedades con esos filtros.</p>
            <p className="mt-2 text-[15px] text-texto-2">Probá con otra zona o sacando algún filtro.</p>
            <LimpiarFiltros />
          </div>
        ) : (
          <>
            <div className="mx-auto mt-6 grid max-w-[1440px] grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 md:px-12 lg:grid-cols-3 2xl:grid-cols-4">
              {lista!.propiedades.map((p, i) => (
                <PropiedadCard key={p.id} p={p} aBorde prioridad={i < 2} className="animate-entrada" />
              ))}
            </div>
            <VerMas busqueda={b} mostradas={lista!.propiedades.length} total={lista!.total} />
          </>
        )}
      </Atenuable>
      <CambiarVista busqueda={b} />
    </MarcoListado>
  );
}
