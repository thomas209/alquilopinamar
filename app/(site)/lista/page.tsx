import type { Metadata } from "next";
import PropiedadCard from "@/components/site/PropiedadCard";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { leerLista, limpiarNombre, tituloLista } from "@/lib/favoritos";
import { metadataDePagina } from "@/lib/seo";
import { propiedadesPorSlugs } from "@/lib/sitio";

type Props = { searchParams: Promise<{ p?: string | string[]; de?: string | string[] }> };

// Lista compartida: las propiedades viajan en el link (?p=slug1,slug2&de=Nombre).
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const slugs = leerLista(sp.p);
  const nombre = limpiarNombre(sp.de);
  const q = new URLSearchParams({ p: slugs.join(","), ...(nombre ? { de: nombre } : {}) }).toString();
  return metadataDePagina({
    titulo: tituloLista(nombre),
    descripcion: slugs.length === 1 ? "1 propiedad guardada en Pinamar y alrededores." : slugs.length + " propiedades guardadas en Pinamar y alrededores.",
    ruta: "/lista",
    imagen: { url: "/api/og/lista?" + q, width: 1200, height: 630, alt: tituloLista(nombre) },
    noIndexar: true,
  });
}

export default async function ListaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const nombre = limpiarNombre(sp.de);
  const propiedades = await propiedadesPorSlugs(leerLista(sp.p));

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-12 md:pt-12">
      <header className="animate-entrada">
        <Rotulo como="p">Lista compartida</Rotulo>
        <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[44px]">{tituloLista(nombre)}</h1>
        <p className="mt-2 max-w-[52ch] text-[15px] text-texto-2">
          {propiedades.length === 0
            ? "Esta lista está vacía o sus propiedades ya no están publicadas."
            : "Tocá el corazón para guardarlas en tus favoritos, o entrá a cada una para consultar."}
        </p>
      </header>

      {propiedades.length === 0 ? (
        <div className="mt-8">
          <Boton href="/propiedades">Ver propiedades</Boton>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((c, i) => (
            <li key={c.slug}>
              <PropiedadCard p={c} prioridad={i < 2} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
