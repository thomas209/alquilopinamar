import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConsultaAcciones from "@/components/admin/ConsultaAcciones";
import { Card } from "@/components/ui/Card";
import Icono from "@/components/ui/Icono";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { ESTADOS_CONSULTA, etiquetaDe, OPERACIONES } from "@/lib/etiquetas";
import { formatearCodigo, formatearDia, formatearFechaHora, noches } from "@/lib/formato";
import { linkWhatsapp, whatsappDeTelefono } from "@/lib/whatsapp";

export const metadata: Metadata = { title: "Consulta" };

type Props = { params: Promise<{ id: string }> };

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>
        <Rotulo>{etiqueta}</Rotulo>
      </dt>
      <dd className="mt-1.5 text-[15px]">{children}</dd>
    </div>
  );
}

export default async function AdminConsultaPage({ params }: Props) {
  const { id } = await params;
  const c = await prisma.inquiry.findUnique({
    where: { id },
    include: { property: { select: { id: true, code: true, slug: true, title: true, operation: true, zone: { select: { name: true } } } } },
  });
  if (!c) notFound();

  const codigo = formatearCodigo(c.property.code);
  const est = ESTADOS_CONSULTA.find((e) => e.valor === c.status);
  const primerNombre = c.name.split(/\s+/)[0];
  const asunto = "Tu consulta por " + codigo + " · " + c.property.title;
  const saludo = "Hola " + primerNombre + ", gracias por tu consulta por " + codigo + " (" + c.property.title + ").\n\n";
  const citado = "\n\n—\nTu mensaje:\n" + c.message.split("\n").map((l) => "> " + l).join("\n");
  const mailto = "mailto:" + c.email + "?subject=" + encodeURIComponent(asunto) + "&body=" + encodeURIComponent(saludo + citado);
  const numero = whatsappDeTelefono(c.phone);
  const whatsapp = numero ? linkWhatsapp(numero, saludo.trim()) : null;

  return (
    <>
      <Link href="/admin/consultas" className="inline-flex items-center gap-1 text-[14px] text-link">
        <Icono nombre="flecha-izq" tamano={16} />
        Consultas
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">{c.name}</h1>
          <p className="mt-1.5 text-[14px] text-texto-2">Recibida el {formatearFechaHora(c.createdAt)}</p>
        </div>
        <PastillaEstado tono={est?.tono ?? "neutro"}>{est?.etiqueta ?? c.status}</PastillaEstado>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_340px] md:gap-12">
        <div className="space-y-8">
          <section>
            <Rotulo como="p">Mensaje</Rotulo>
            <Card className="mt-3">
              <p className="text-[16px] leading-relaxed whitespace-pre-line">{c.message}</p>
            </Card>
          </section>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <Dato etiqueta="Mail">
              <a href={"mailto:" + c.email} className="break-all text-link">
                {c.email}
              </a>
            </Dato>
            <Dato etiqueta="Teléfono">{c.phone ? <a href={"tel:" + c.phone.replace(/[^\d+]/g, "")} className="text-link">{c.phone}</a> : <span className="text-texto-2">No dejó</span>}</Dato>
            {c.checkIn && c.checkOut && (
              <Dato etiqueta="Estadía">
                {formatearDia(c.checkIn)} → {formatearDia(c.checkOut)}
                <span className="text-texto-2"> · {noches(c.checkIn, c.checkOut)} noches</span>
              </Dato>
            )}
            {c.guests && <Dato etiqueta="Huéspedes">{c.guests}</Dato>}
          </dl>

          <section>
            <Rotulo como="p">Propiedad</Rotulo>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-gris-200 p-5">
              <div className="min-w-0">
                <Rotulo como="p">
                  {codigo} · {c.property.zone.name} · {etiquetaDe(OPERACIONES, c.property.operation)}
                </Rotulo>
                <p className="mt-1.5 truncate text-[15px] font-medium">{c.property.title}</p>
              </div>
              <div className="flex gap-4 text-[14px]">
                <Link href={"/propiedad/" + c.property.slug} target="_blank" className="text-link">
                  Ver ficha
                </Link>
                <Link href={"/admin/propiedades/" + c.property.id} className="text-link">
                  Editar
                </Link>
              </div>
            </div>
          </section>
        </div>

        <aside>
          <ConsultaAcciones id={c.id} estado={c.status} notas={c.adminNotes ?? ""} mailto={mailto} whatsapp={whatsapp} />
        </aside>
      </div>
    </>
  );
}
