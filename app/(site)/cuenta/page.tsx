import Link from "next/link";
import { redirect } from "next/navigation";
import DatosCuenta, { CerrarSesion } from "@/components/cuenta/DatosCuenta";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { prisma } from "@/lib/prisma";
import { formatearCodigo, formatearFechaHora } from "@/lib/formato";
import { metadataDePagina } from "@/lib/seo";
import { nombreCompleto, usuarioActual } from "@/lib/usuarios";

export const metadata = metadataDePagina({ titulo: "Tu cuenta", descripcion: "Tus datos y tus consultas en AlquiloPinamar.", ruta: "/cuenta", noIndexar: true });

// Lo que ve quien consulto: "Enviada" en vez de "Nueva"
const ESTADO = { NUEVA: { texto: "Enviada", tono: "neutro" }, RESPONDIDA: { texto: "Respondida", tono: "ok" }, CERRADA: { texto: "Cerrada", tono: "neutro" } } as const;

export default async function CuentaPage() {
  const u = await usuarioActual();
  if (!u) redirect("/ingresar?volver=/cuenta");

  const consultas = await prisma.inquiry.findMany({
    where: { email: u.email },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, createdAt: true, status: true, message: true, property: { select: { code: true, title: true, slug: true, status: true, deletedAt: true } } },
  });
  const nombre = nombreCompleto(u);

  return (
    <div className="mx-auto max-w-[760px] px-4 pt-8 pb-20 md:px-0 md:pt-12">
      <header className="animate-entrada">
        <Rotulo como="p">Tu cuenta</Rotulo>
        <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[44px]">{nombre ? "Hola, " + u.firstName : "Hola"}</h1>
        <p className="mt-2 text-[15px] text-texto-2">{u.email}</p>
      </header>

      <section className="mt-10">
        <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">Tus datos</h2>
        <p className="mt-1 text-[14px] text-texto-2">Los usamos para completar tus consultas. Nadie más los ve.</p>
        <DatosCuenta inicial={{ firstName: u.firstName, lastName: u.lastName, phone: u.phone ?? "" }} />
      </section>

      <section className="mt-14">
        <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">Tus consultas</h2>
        {consultas.length === 0 ? (
          <p className="mt-2 text-[15px] text-texto-2">
            Todavía no consultaste por ninguna propiedad.{" "}
            <Link href="/propiedades" className="text-link">
              Ver propiedades
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gris-200 border-y border-gris-200">
            {consultas.map((c) => {
              const visible = c.property.status === "PUBLICADA" && !c.property.deletedAt;
              const estado = ESTADO[c.status];
              return (
                <li key={c.id} className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Rotulo como="p">
                        {formatearCodigo(c.property.code)} · {formatearFechaHora(c.createdAt)}
                      </Rotulo>
                      {visible ? (
                        <Link href={"/propiedad/" + c.property.slug} className="mt-1.5 block truncate font-titulo text-[17px] font-medium tracking-[-0.02em] hover:underline">
                          {c.property.title}
                        </Link>
                      ) : (
                        <p className="mt-1.5 truncate font-titulo text-[17px] font-medium tracking-[-0.02em] text-texto-2">{c.property.title} · ya no publicada</p>
                      )}
                      <p className="mt-1 line-clamp-2 text-[14px] text-texto-2">{c.message}</p>
                    </div>
                    <PastillaEstado tono={estado.tono} className="shrink-0">
                      {estado.texto}
                    </PastillaEstado>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="mt-14">
        <CerrarSesion />
      </div>
    </div>
  );
}
