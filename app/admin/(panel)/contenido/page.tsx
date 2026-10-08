import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SubirPortada from "@/components/admin/SubirPortada";
import { leerPortadaHome } from "@/lib/portadas";
import { destacadas, listarPropiedades, recientes } from "@/lib/sitio";

export const metadata: Metadata = { title: "Contenido" };

// Fotos de portada de la home y de cada zona.
export default async function AdminContenidoPage() {
  const [home, top, nuevas, zonas] = await Promise.all([
    leerPortadaHome(),
    destacadas(),
    recientes(),
    prisma.zone.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { slug: true, name: true, coverImage: true, isActive: true },
    }),
  ]);
  // Lo mismo que muestra el sitio cuando no hay portada cargada
  const respaldoHome = (top[0] ?? nuevas[0])?.fotos[0] ?? null;
  const respaldosZona = await Promise.all(
    zonas.map(async (z) => (await listarPropiedades({ zona: z.slug, limite: 1 })).propiedades[0]?.fotos[0] ?? null),
  );

  return (
    <div className="pb-16">
      <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Contenido</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-texto-2">
        Fotos de portada. Conviene que sean horizontales y de buena resolución (2400 px de ancho o más). Se suben en calidad original.
      </p>

      <section className="mt-10">
        <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">Home</h2>
        <div className="mt-4 max-w-[560px]">
          <SubirPortada
            destino="home"
            titulo="Portada de la home"
            url={home}
            respaldo={respaldoHome}
            enlace="/"
            textoRespaldo="Sin foto elegida: se usa la de la primera propiedad destacada."
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">Zonas</h2>
        {zonas.length === 0 ? (
          <p className="mt-3 text-[15px] text-texto-2">Todavía no hay zonas.</p>
        ) : (
          <ul className="mt-4 grid gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            {zonas.map((z, i) => (
              <li key={z.slug}>
                <SubirPortada
                  destino={"zona:" + z.slug}
                  titulo={z.name + (z.isActive ? "" : " (oculta)")}
                  url={z.coverImage}
                  respaldo={respaldosZona[i]}
                  enlace={"/zonas/" + z.slug}
                  textoRespaldo="Sin foto elegida: se usa la de su primera propiedad."
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
