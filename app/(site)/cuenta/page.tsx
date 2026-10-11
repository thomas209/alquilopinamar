import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonSalir, DatosCuenta } from "@/components/site/Cuenta";
import Foto from "@/components/site/Foto";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { prisma } from "@/lib/prisma";
import { formatearCodigo, formatearDia, formatearFechaHora } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";
import { usuarioActual } from "@/lib/usuarios";

export const metadata = metadataDePagina({
  titulo: "Tu cuenta",
  descripcion: "Tus datos y tus consultas en AlquiloPinamar.",
  ruta: "/cuenta",
  noIndexar: true,
});

// Como lo ve quien consulto (en el admin "Nueva" es "sin responder")
const ESTADO = {
  NUEVA: { texto: "Enviada", tono: "normal" },
  RESPONDIDA: { texto: "Respondida", tono: "negro" },
  CERRADA: { texto: "Cerrada", tono: "normal" },
} as const;

export default async function CuentaPage() {
  const usuario = await usuarioActual();
  if (!usuario) redirect("/cuenta/ingresar?volver=/cuenta");

  // Las de la cuenta, y las que hizo antes con el mismo mail (el mail ya esta verificado)
  const consultas = await prisma.inquiry.findMany({
    where: { OR: [{ userId: usuario.id }, { email: usuario.email }] },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      createdAt: true,
      status: true,
      checkIn: true,
      checkOut: true,
      property: {
        select: {
          code: true,
          slug: true,
          title: true,
          status: true,
          deletedAt: true,
          zone: { select: { name: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  const nombre = usuario.firstName || usuario.email.split("@")[0];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-16 md:px-12 md:pt-16">
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Rotulo como="p">Tu cuenta</Rotulo>
          <h1 className="mt-4 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[48px]">Hola, {nombre}</h1>
          <p className="mt-3 text-[16px] break-all text-texto-2">{usuario.email}</p>
        </div>
        <div className="hidden md:block">
          <BotonSalir />
        </div>
      </header>

      <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
        <section aria-labelledby="t-datos">
          <h2 id="t-datos" className="font-titulo text-[22px] font-medium tracking-[-0.02em]">
            Tus datos
          </h2>
          <p className="mt-2 mb-6 text-[15px] text-texto-2">Los usamos para completar tus consultas. Solo los ve quien publica la propiedad por la que consultás.</p>
          <DatosCuenta usuario={usuario} />
        </section>

        <section aria-labelledby="t-consultas">
          <h2 id="t-consultas" className="font-titulo text-[22px] font-medium tracking-[-0.02em]">
            Tus consultas
          </h2>
          {consultas.length === 0 ? (
            <div className="mt-6 rounded-card bg-gris-50 px-6 py-8">
              <p className="text-[16px]">Todavía no consultaste por ninguna propiedad.</p>
              <Link href="/propiedades" className="mt-3 inline-block text-[15px] text-link hover:opacity-70">
                Ver propiedades
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-gris-200">
              {consultas.map((c) => {
                const p = c.property;
                const disponible = p.status === "PUBLICADA" && !p.deletedAt;
                const foto = p.images[0]?.url;
                const contenido = (
                  <>
                    <div className="size-20 shrink-0 overflow-hidden rounded-campo bg-gris-100 md:size-24">
                      {foto && <Foto url={foto} alt="" sizes="96px" recorte="1:1" anchos={[160, 240]} className="size-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Rotulo como="p">
                        {formatearCodigo(p.code)} · {p.zone.name}
                      </Rotulo>
                      <p className="mt-2 truncate text-[16px] font-medium">{p.title}</p>
                      <p className="mt-1 text-[14px] text-texto-2">
                        {formatearFechaHora(c.createdAt)}
                        {c.checkIn && c.checkOut && " · " + formatearDia(c.checkIn) + " → " + formatearDia(c.checkOut)}
                      </p>
                      {!disponible && <p className="mt-1 text-[13px] text-texto-2">Ya no está publicada</p>}
                    </div>
                    <Rotulo tono={ESTADO[c.status].tono} className="shrink-0 self-start pt-1">
                      {ESTADO[c.status].texto}
                    </Rotulo>
                  </>
                );
                return (
                  <li key={c.id}>
                    {disponible ? (
                      <Link href={"/propiedad/" + p.slug} className="flex gap-4 py-5 transition-opacity duration-200 hover:opacity-80">
                        {contenido}
                      </Link>
                    ) : (
                      <div className="flex gap-4 py-5 opacity-70">{contenido}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-6 text-[14px] text-texto-2">
            Las respuestas te llegan por mail o WhatsApp. ¿Buscás las que guardaste?{" "}
            <Link href="/favoritos" className="text-link hover:opacity-70">
              Ver favoritos
            </Link>
          </p>
        </section>
      </div>

      <section aria-labelledby="t-publicar" className="mt-16 flex flex-col gap-5 rounded-card bg-gris-50 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <div>
          <h2 id="t-publicar" className="font-titulo text-[22px] font-medium tracking-[-0.02em]">
            {usuario.isHost ? "Tus propiedades" : "¿Tenés una propiedad en la costa?"}
          </h2>
          <p className="mt-2 text-[15px] text-texto-2">
            {usuario.isHost ? "Editá tus publicaciones, pausalas o publicá otra." : "Publicala gratis: te guiamos paso a paso y la revisamos antes de que salga."}
          </p>
        </div>
        <Boton href={usuario.isHost ? "/panel/propiedades" : "/panel/propiedades/nueva"} className="self-start md:self-auto">
          {usuario.isHost ? "Ir a mis propiedades" : "Publicar mi propiedad"}
        </Boton>
      </section>

      <div className="mt-14 md:hidden">
        <BotonSalir />
      </div>
    </div>
  );
}
