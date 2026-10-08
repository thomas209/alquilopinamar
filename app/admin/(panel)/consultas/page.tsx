import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Boton from "@/components/ui/Boton";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { ESTADOS_CONSULTA } from "@/lib/etiquetas";
import { formatearCodigo, formatearFechaHora } from "@/lib/formato";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Consultas" };

const POR_PAGINA = 100;

export default async function AdminConsultasPage({ searchParams }: { searchParams: Promise<{ estado?: string; q?: string }> }) {
  const { estado = "", q = "" } = await searchParams;
  const busqueda = q.trim();
  const estadoOk = ESTADOS_CONSULTA.find((e) => e.valor === estado)?.valor;

  const where: Prisma.InquiryWhereInput = {};
  if (estadoOk) where.status = estadoOk;
  if (busqueda) {
    // Por nombre, mail o codigo de propiedad ("AP-0012" o "12")
    const codigo = parseInt(busqueda.replace(/\D/g, ""), 10);
    where.OR = [
      { name: { contains: busqueda, mode: "insensitive" } },
      { email: { contains: busqueda, mode: "insensitive" } },
      ...(Number.isFinite(codigo) ? [{ property: { code: codigo } }] : []),
    ];
  }

  const [consultas, porEstado] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: POR_PAGINA,
      select: { id: true, name: true, message: true, status: true, createdAt: true, property: { select: { code: true, title: true } } },
    }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const cuenta = Object.fromEntries(porEstado.map((g) => [g.status, g._count._all])) as Record<string, number>;
  const total = porEstado.reduce((s, g) => s + g._count._all, 0);

  const pestanas = [{ valor: "", etiqueta: "Todas", cantidad: total }, ...ESTADOS_CONSULTA.map((e) => ({ valor: e.valor as string, etiqueta: e.plural as string, cantidad: cuenta[e.valor] ?? 0 }))];
  const href = (e: string) => "/admin/consultas" + (e || busqueda ? "?" + new URLSearchParams({ ...(e ? { estado: e } : {}), ...(busqueda ? { q: busqueda } : {}) }) : "");

  return (
    <>
      <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Consultas</h1>

      <nav aria-label="Filtrar por estado" className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {pestanas.map((p) => {
          const activa = (estadoOk ?? "") === p.valor;
          return (
            <Link
              key={p.valor}
              href={href(p.valor)}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "flex h-11 shrink-0 items-center gap-2 rounded-pastilla px-[18px] text-[14px] font-medium transition-colors duration-200",
                activa ? "bg-negro text-blanco" : "bg-gris-100 text-negro hover:bg-gris-200",
              )}
            >
              {p.etiqueta}
              <span className={cn("tabular-nums", activa ? "text-blanco/60" : "text-texto-2")}>{p.cantidad}</span>
            </Link>
          );
        })}
      </nav>

      <form className="mt-3 flex gap-2">
        {estadoOk && <input type="hidden" name="estado" value={estadoOk} />}
        <input
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por nombre, mail o código"
          className="h-11 min-w-0 flex-1 rounded-pastilla border border-transparent bg-gris-100 px-4 text-[16px] outline-none placeholder:text-gris-400 focus:border-negro md:text-[14px]"
        />
        <Boton type="submit" variante="secundario" tamano="chico">
          Buscar
        </Boton>
        {busqueda && (
          <Boton variante="texto" href={href(estadoOk ?? "")}>
            Limpiar
          </Boton>
        )}
      </form>

      {consultas.length === 0 ? (
        <p className="mt-8 text-[14px] text-texto-2">
          {busqueda || estadoOk ? "No hay consultas con esos filtros." : "Todavía no llegó ninguna consulta. Cuando alguien consulte desde una ficha, aparece acá."}
        </p>
      ) : (
        <ul className="mt-6 border-t border-gris-200">
          {consultas.map((c) => {
            const est = ESTADOS_CONSULTA.find((e) => e.valor === c.status);
            const nueva = c.status === "NUEVA";
            return (
              <li key={c.id} className="border-b border-gris-200">
                <Link href={"/admin/consultas/" + c.id} className="flex items-start gap-4 py-4 transition-opacity duration-200 hover:opacity-70">
                  <span aria-hidden="true" className={cn("mt-[7px] size-2 shrink-0 rounded-full", nueva ? "bg-negro" : "bg-transparent")} />
                  <span className="min-w-0 flex-1">
                    <Rotulo className="block truncate text-[10px]">
                      {formatearCodigo(c.property.code)} · {c.property.title}
                    </Rotulo>
                    <span className={cn("mt-1.5 block truncate text-[15px]", nueva ? "font-semibold" : "font-medium")}>{c.name}</span>
                    <span className="mt-1 line-clamp-1 block text-[13px] text-texto-2">{c.message}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-[12px] text-texto-2 tabular-nums">{formatearFechaHora(c.createdAt)}</span>
                    <PastillaEstado tono={est?.tono ?? "neutro"}>{est?.etiqueta ?? c.status}</PastillaEstado>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {consultas.length === POR_PAGINA && <p className="mt-4 text-[13px] text-texto-2">Se muestran las {POR_PAGINA} más recientes. Usá el buscador para encontrar el resto.</p>}
    </>
  );
}
