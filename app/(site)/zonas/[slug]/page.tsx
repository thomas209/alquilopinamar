import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Foto from "@/components/site/Foto";
import PropiedadCard from "@/components/site/PropiedadCard";
import TextoPlegable from "@/components/site/TextoPlegable";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { OPERACIONES_URL, urlDeBusqueda } from "@/lib/busqueda";
import { listarPropiedades, zonaPorSlug, zonasActivas } from "@/lib/sitio";

type Props = { params: Promise<{ slug: string }> };

const EN_PAGINA = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const z = await zonaPorSlug(slug);
  if (!z) return { title: "Zona no encontrada" };
  const titulo = z.seoTitle || "Alquiler y venta de propiedades en " + z.name;
  const descripcion =
    z.seoDescription ||
    (z.description ? z.description.replace(/\s+/g, " ").slice(0, 155) : "Casas y departamentos en alquiler temporario, alquiler anual y venta en " + z.name + ". Fotos, precios y consulta directa.");
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: "/zonas/" + z.slug },
    openGraph: { title: titulo, description: descripcion, url: "/zonas/" + z.slug },
  };
}

export default async function ZonaPage({ params }: Props) {
  const { slug } = await params;
  const z = await zonaPorSlug(slug);
  if (!z) notFound();

  const [{ propiedades, total }, zonas] = await Promise.all([listarPropiedades({ zona: z.slug, limite: EN_PAGINA }), zonasActivas()]);
  // Sin foto de portada cargada para la zona, se usa la primera foto de sus propiedades.
  const portada = z.coverImage || propiedades[0]?.fotos[0];
  const operaciones = OPERACIONES_URL.map((o) => ({ ...o, cantidad: z.porOperacion[o.valor] ?? 0 })).filter((o) => o.cantidad > 0);
  const otras = zonas.filter((o) => o.slug !== z.slug);

  return (
    <>
      <section className="relative isolate flex min-h-[52svh] items-end bg-gris-100 md:min-h-[58svh]">
        {portada && <Foto url={portada} alt={z.name} sizes="100vw" anchos={[800, 1200, 1600, 2400]} prioridad className="absolute inset-0 -z-10 h-full w-full object-cover" />}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-10 pb-5 md:px-12 md:pb-10">
          <div className="inline-block rounded-hoja bg-blanco/85 px-5 py-4 backdrop-blur-md">
            <Rotulo como="p">Zona · Partido de Pinamar</Rotulo>
            <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">{z.name}</h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 pt-8 md:px-12 md:pt-12">
        {z.description && <TextoPlegable texto={z.description} lineas={5} className="max-w-[68ch] text-[17px] leading-relaxed" />}

        {operaciones.length > 0 && (
          <div className={z.description ? "mt-8" : ""}>
            <Rotulo como="p">Buscar en {z.name}</Rotulo>
            <div className="mt-3 flex flex-wrap gap-2">
              {operaciones.map((o) => (
                <Boton key={o.url} href={urlDeBusqueda({ zona: z.slug, operacion: o.url })} variante="secundario" tamano="chico">
                  {o.titulo}
                  <span className="text-texto-2 tabular-nums">{o.cantidad}</span>
                </Boton>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className="mx-auto max-w-[1440px] pt-10 md:px-12 md:pt-14">
        <h2 className="px-4 font-titulo text-[26px] font-semibold tracking-[-0.02em] md:px-0 md:text-[32px]">Propiedades en {z.name}</h2>
        {propiedades.length === 0 ? (
          <div className="px-4 md:px-0">
            <p className="mt-3 text-[15px] text-texto-2">Todavía no hay propiedades publicadas en {z.name}.</p>
            <Boton href="/propiedades" tamano="chico" className="mt-5">
              Ver todas las propiedades
            </Boton>
          </div>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {propiedades.map((p, i) => (
                <PropiedadCard key={p.id} p={p} aBorde prioridad={i < 2} />
              ))}
            </div>
            {total > propiedades.length && (
              <div className="mt-10 flex justify-center px-4">
                <Boton href={urlDeBusqueda({ zona: z.slug })} variante="secundario">
                  Ver las {total} propiedades
                </Boton>
              </div>
            )}
          </>
        )}
      </section>

      {otras.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 pt-14 md:px-12">
          <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">Otras zonas</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otras.map((o) => (
              <Boton key={o.slug} href={"/zonas/" + o.slug} variante="secundario" tamano="chico">
                {o.name}
              </Boton>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
