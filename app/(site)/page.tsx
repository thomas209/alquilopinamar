import Link from "next/link";
import Buscador from "@/components/site/Buscador";
import Foto from "@/components/site/Foto";
import PropiedadCard from "@/components/site/PropiedadCard";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { destacadas, recientes, zonasActivas } from "@/lib/sitio";
import JsonLd from "@/components/site/JsonLd";
import { jsonLdSitio } from "@/lib/jsonld";
import { metadataDePagina, SITE_DESCRIPCION, SITE_NOMBRE } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: SITE_NOMBRE + " · Alquiler y venta de propiedades en Pinamar, Cariló y la costa",
  tituloAbsoluto: true,
  descripcion: SITE_DESCRIPCION,
  ruta: "/",
});

export default async function HomePage() {
  const [zonas, top, nuevas] = await Promise.all([zonasActivas(), destacadas(), recientes()]);
  // Mientras no haya una foto de portada cargada desde el admin, se usa la de la primera destacada.
  const portada = (top[0] ?? nuevas[0])?.fotos[0];

  return (
    <>
      <JsonLd datos={jsonLdSitio()} />
      <section className="relative isolate flex min-h-[78svh] items-end bg-gris-100 md:min-h-[82svh] md:items-center">
        {portada && <Foto url={portada} alt="" sizes="100vw" anchos={[800, 1200, 1600, 2400]} prioridad className="absolute inset-0 -z-10 h-full w-full object-cover" />}
        <div className="mx-auto w-full max-w-[1440px] px-4 pt-10 pb-5 md:px-12 md:py-16">
          <div className="mb-5 inline-block rounded-hoja bg-blanco/85 px-5 py-4 backdrop-blur-md md:mb-6">
            <Rotulo como="p">Pinamar · Cariló · Valeria del Mar · Ostende · Costa Esmeralda</Rotulo>
            <h1 className="mt-3 max-w-[16ch] font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">Tu casa en la costa.</h1>
          </div>
          <Buscador zonas={zonas} />
        </div>
      </section>

      {top.length > 0 && (
        <section className="mx-auto max-w-[1440px] pt-12 md:px-12 md:pt-16">
          <h2 className="px-4 font-titulo text-[26px] font-semibold tracking-[-0.02em] md:px-0 md:text-[32px]">Destacadas</h2>
          <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:px-0 [&::-webkit-scrollbar]:hidden">
            {top.map((p) => (
              <PropiedadCard key={p.id} p={p} className="w-[82vw] max-w-[420px] shrink-0 snap-start md:w-[380px]" />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-[1440px] pt-12 md:px-12 md:pt-16">
        <div className="flex items-end justify-between gap-4 px-4 md:px-0">
          <h2 className="font-titulo text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">Recién publicadas</h2>
          <Link href="/propiedades" className="shrink-0 text-[14px] text-link">
            Ver todas
          </Link>
        </div>
        {nuevas.length === 0 ? (
          <p className="mt-4 px-4 text-[15px] text-texto-2 md:px-0">Todavía no hay propiedades publicadas.</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-x-5 gap-y-9 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {nuevas.map((p) => (
              <PropiedadCard key={p.id} p={p} aBorde />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pt-12 md:px-12 md:pt-16">
        <h2 className="font-titulo text-[26px] font-semibold tracking-[-0.02em] md:text-[32px]">Zonas</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {zonas.map((z) => (
            <Boton key={z.slug} href={"/zonas/" + z.slug} variante="secundario" tamano="chico">
              {z.name}
            </Boton>
          ))}
        </div>
      </section>
    </>
  );
}
