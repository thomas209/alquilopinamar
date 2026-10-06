import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Boton from "@/components/ui/Boton";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Precio from "@/components/ui/Precio";
import Rotulo from "@/components/ui/Rotulo";
import { ESTADOS, OPERACIONES, TIPOS, etiquetaDe } from "@/lib/etiquetas";
import { formatearCodigo } from "@/lib/formato";

export const metadata: Metadata = { title: "Propiedades" };

const SELECT =
  "h-11 rounded-pastilla border border-transparent bg-gris-100 px-4 text-[14px] text-negro outline-none focus:border-negro";

export default async function AdminPropiedadesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; operacion?: string; zona?: string }>;
}) {
  const { q = "", estado = "", operacion = "", zona = "" } = await searchParams;
  const busqueda = q.trim();

  const where: Prisma.PropertyWhereInput = { deletedAt: null };
  const estadoOk = ESTADOS.find((e) => e.valor === estado)?.valor;
  const operacionOk = OPERACIONES.find((o) => o.valor === operacion)?.valor;
  if (estadoOk) where.status = estadoOk;
  if (operacionOk) where.operation = operacionOk;
  if (zona) where.zoneId = zona;
  if (busqueda) {
    // Se puede buscar por codigo ("AP-0012" o "12") o por titulo
    const codigo = parseInt(busqueda.replace(/\D/g, ""), 10);
    where.OR = [
      { title: { contains: busqueda, mode: "insensitive" } },
      ...(Number.isFinite(codigo) ? [{ code: codigo }] : []),
    ];
  }

  const [propiedades, zonas] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { zone: { select: { name: true } }, _count: { select: { images: true } } },
    }),
    prisma.zone.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);

  const hayFiltros = Boolean(busqueda || estadoOk || operacionOk || zona);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Propiedades</h1>
        <Boton tamano="chico" href="/admin/propiedades/nueva">
          Nueva propiedad
        </Boton>
      </div>

      <form className="mt-6 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={busqueda}
          placeholder="Buscar por código o título"
          className="h-11 min-w-0 flex-1 basis-full rounded-pastilla border border-transparent bg-gris-100 px-4 text-[16px] outline-none placeholder:text-gris-400 focus:border-negro md:basis-0 md:text-[14px]"
        />
        <select name="estado" defaultValue={estadoOk ?? ""} aria-label="Estado" className={SELECT}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
        <select name="operacion" defaultValue={operacionOk ?? ""} aria-label="Operación" className={SELECT}>
          <option value="">Todas las operaciones</option>
          {OPERACIONES.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </select>
        <select name="zona" defaultValue={zona} aria-label="Zona" className={SELECT}>
          <option value="">Todas las zonas</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
        <Boton type="submit" variante="secundario" tamano="chico">
          Filtrar
        </Boton>
        {hayFiltros && (
          <Boton variante="texto" href="/admin/propiedades">
            Limpiar
          </Boton>
        )}
      </form>

      {propiedades.length === 0 ? (
        <p className="mt-8 text-[14px] text-texto-2">
          {hayFiltros ? "No hay propiedades con esos filtros." : "Todavía no hay propiedades. Cargá la primera con “Nueva propiedad”."}
        </p>
      ) : (
        <ul className="mt-6 border-t border-gris-200">
          {propiedades.map((p) => {
            const est = ESTADOS.find((e) => e.valor === p.status);
            return (
              <li key={p.id} className="border-b border-gris-200">
                <Link
                  href={"/admin/propiedades/" + p.id}
                  className="flex items-center gap-4 py-4 transition-opacity duration-200 hover:opacity-70"
                >
                  <span className="min-w-0 flex-1">
                    <Rotulo className="block text-[10px]">
                      {formatearCodigo(p.code)} · {p.zone.name} · {etiquetaDe(TIPOS, p.type)} ·{" "}
                      {OPERACIONES.find((o) => o.valor === p.operation)?.corta}
                    </Rotulo>
                    <span className="mt-1.5 block truncate text-[15px] font-medium">{p.title}</span>
                    <span className="mt-1 flex flex-wrap items-baseline gap-x-3 text-[13px] text-texto-2">
                      <Precio monto={p.priceOnRequest || p.price === null ? null : Number(p.price)} moneda={p.currency} periodo={p.pricePeriod} />
                      <span>
                        {p._count.images} {p._count.images === 1 ? "foto" : "fotos"}
                      </span>
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1.5">
                    <PastillaEstado tono={est?.tono ?? "neutro"}>{est?.etiqueta ?? p.status}</PastillaEstado>
                    {p.isFeatured && <PastillaEstado tono="negro">Destacada</PastillaEstado>}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {propiedades.length === 100 && (
        <p className="mt-4 text-[13px] text-texto-2">Se muestran las 100 más recientes. Usá el buscador para encontrar el resto.</p>
      )}
    </>
  );
}
