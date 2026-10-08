import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { ESTADOS_CONSULTA } from "@/lib/etiquetas";
import { formatearCodigo, formatearFechaHora } from "@/lib/formato";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Inicio" };

const DIA = 86_400_000;
// Fecha de hace N dias (fuera del componente: la pagina se arma en cada pedido)
const haceDias = (dias: number) => new Date(Date.now() - dias * DIA);
const n = (x: number) => x.toLocaleString("es-AR");
const pct = (a: number, b: number) => (b === 0 ? "—" : (a / b).toLocaleString("es-AR", { style: "percent", maximumFractionDigits: 1 }));

function Numero({ etiqueta, valor, detalle, href }: { etiqueta: string; valor: string; detalle?: string; href?: string }) {
  const contenido = (
    <Card className="h-full">
      <Rotulo como="p" className="leading-snug">
        {etiqueta}
      </Rotulo>
      <p className="mt-3 font-titulo text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{valor}</p>
      {detalle && <p className="mt-2 text-[13px] text-texto-2">{detalle}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="transition-transform duration-200 ease-app active:scale-[0.97]">
      {contenido}
    </Link>
  ) : (
    contenido
  );
}

function Titulo({ children, accion }: { children: React.ReactNode; accion?: React.ReactNode }) {
  return (
    <div className="mt-12 flex items-end justify-between gap-4">
      <h2 className="font-titulo text-[22px] font-medium tracking-[-0.02em]">{children}</h2>
      {accion}
    </div>
  );
}

export default async function AdminInicioPage() {
  const hace7 = haceDias(7);
  const hace30 = haceDias(30);
  const PUBLICADA = { status: "PUBLICADA" as const, deletedAt: null };

  const [publicadas, borradores, nuevas, consultas7, consultas30, totales, masVistas, ultimas] = await Promise.all([
    prisma.property.count({ where: PUBLICADA }),
    prisma.property.count({ where: { status: "BORRADOR", deletedAt: null } }),
    prisma.inquiry.count({ where: { status: "NUEVA" } }),
    prisma.inquiry.count({ where: { createdAt: { gte: hace7 } } }),
    prisma.inquiry.count({ where: { createdAt: { gte: hace30 } } }),
    prisma.property.aggregate({ where: { deletedAt: null }, _sum: { viewCount: true, whatsappClicks: true } }),
    prisma.property.findMany({
      where: PUBLICADA,
      orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
      take: 8,
      select: { id: true, code: true, title: true, viewCount: true, whatsappClicks: true, zone: { select: { name: true } }, _count: { select: { inquiries: true } } },
    }),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, status: true, createdAt: true, property: { select: { code: true } } },
    }),
  ]);

  const visitas = totales._sum.viewCount ?? 0;
  const clics = totales._sum.whatsappClicks ?? 0;

  return (
    <>
      <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Inicio</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Numero etiqueta="Consultas sin responder" valor={n(nuevas)} href="/admin/consultas?estado=NUEVA" />
        <Numero etiqueta="Consultas" valor={n(consultas7)} detalle={"Últimos 7 días · " + n(consultas30) + " en 30 días"} href="/admin/consultas" />
        <Numero etiqueta="Publicadas" valor={n(publicadas)} detalle={borradores ? n(borradores) + (borradores === 1 ? " borrador" : " borradores") : undefined} href="/admin/propiedades?estado=PUBLICADA" />
        <Numero etiqueta="Visitas a fichas" valor={n(visitas)} detalle={n(clics) + " clics en WhatsApp"} />
      </div>
      <p className="mt-3 text-[12px] text-texto-2">Visitas y clics se cuentan desde que se publicó cada propiedad (una visita por persona y sesión, sin robots).</p>

      <Titulo
        accion={
          <Link href="/admin/propiedades" className="text-[14px] text-link">
            Ver todas
          </Link>
        }
      >
        Propiedades con más interés
      </Titulo>
      {masVistas.length === 0 ? (
        <p className="mt-4 text-[14px] text-texto-2">Todavía no hay propiedades publicadas.</p>
      ) : (
        <div className="-mx-4 mt-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[560px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-gris-200">
                <th className="py-3 pr-4 font-normal">
                  <Rotulo>Propiedad</Rotulo>
                </th>
                {["Visitas", "WhatsApp", "Consultas", "Interés"].map((t) => (
                  <th key={t} className="py-3 pl-4 text-right font-normal">
                    <Rotulo>{t}</Rotulo>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {masVistas.map((p) => (
                <tr key={p.id} className="border-b border-gris-200">
                  <td className="max-w-0 py-3.5 pr-4">
                    <Link href={"/admin/propiedades/" + p.id} className="block truncate font-medium hover:opacity-70">
                      <span className="font-rotulo text-[11px] tracking-[0.08em] text-texto-2">{formatearCodigo(p.code)}</span> {p.title}
                    </Link>
                    <span className="text-[12px] text-texto-2">{p.zone.name}</span>
                  </td>
                  <td className="py-3.5 pl-4 text-right tabular-nums">{n(p.viewCount)}</td>
                  <td className="py-3.5 pl-4 text-right tabular-nums">{n(p.whatsappClicks)}</td>
                  <td className="py-3.5 pl-4 text-right tabular-nums">
                    {p._count.inquiries > 0 ? (
                      <Link href={"/admin/consultas?q=" + formatearCodigo(p.code)} className="text-link">
                        {n(p._count.inquiries)}
                      </Link>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="py-3.5 pl-4 text-right text-texto-2 tabular-nums">{pct(p.whatsappClicks + p._count.inquiries, p.viewCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[12px] text-texto-2">Interés = (clics en WhatsApp + consultas) ÷ visitas.</p>
        </div>
      )}

      <Titulo
        accion={
          <Link href="/admin/consultas" className="text-[14px] text-link">
            Ver todas
          </Link>
        }
      >
        Últimas consultas
      </Titulo>
      {ultimas.length === 0 ? (
        <p className="mt-4 text-[14px] text-texto-2">Todavía no llegó ninguna consulta.</p>
      ) : (
        <ul className="mt-4 border-t border-gris-200">
          {ultimas.map((c) => {
            const est = ESTADOS_CONSULTA.find((e) => e.valor === c.status);
            return (
              <li key={c.id} className="border-b border-gris-200">
                <Link href={"/admin/consultas/" + c.id} className="flex items-center gap-4 py-3.5 transition-opacity hover:opacity-70">
                  <span className={cn("min-w-0 flex-1 truncate text-[15px]", c.status === "NUEVA" ? "font-semibold" : "font-medium")}>
                    {c.name} <span className="font-rotulo text-[11px] font-normal tracking-[0.08em] text-texto-2">· {formatearCodigo(c.property.code)}</span>
                  </span>
                  <span className="hidden text-[12px] text-texto-2 tabular-nums sm:inline">{formatearFechaHora(c.createdAt)}</span>
                  <PastillaEstado tono={est?.tono ?? "neutro"}>{est?.etiqueta ?? c.status}</PastillaEstado>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
