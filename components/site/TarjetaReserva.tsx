"use client";
import { ProximoDisponible, type PeriodoFicha } from "@/components/site/DisponibilidadPrecios";
import Icono from "@/components/ui/Icono";
import { cn } from "@/lib/cn";
import { cotizar, diaMes, pisaOcupado, textoNochesCorto, type Rango } from "@/lib/disponibilidad";
import { formatearMonto, type Moneda } from "@/lib/formato";
import { useFechasDe } from "@/store/fechas";

const noches = (n: number) => n + (n === 1 ? " noche" : " noches");

function irAlCalendario() {
  document.getElementById("elegir-fechas")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Tarjeta de reserva de la ficha (alquiler temporario), como en Airbnb:
// fechas y huespedes (los mismos del calendario), desglose y total.
export default function TarjetaReserva({
  slug,
  periodos,
  ocupados,
  hoy,
  precioBase,
  moneda,
  limpieza,
  deposito,
  maxHuespedes,
  minNoches,
}: {
  slug: string;
  periodos: PeriodoFicha[];
  ocupados: Rango[];
  hoy: string;
  precioBase: number | null;
  moneda: Moneda;
  limpieza: number | null;
  deposito: number | null;
  maxHuespedes: number | null;
  minNoches: number | null;
}) {
  const { desde, hasta, huespedes, ponerFechas, ponerHuespedes } = useFechasDe(slug);
  const cot = desde && hasta ? cotizar(desde, hasta, periodos, precioBase) : null;
  const total = cot && cot.total !== null ? cot.total + (limpieza ?? 0) : null;
  const ocupadas = desde && hasta ? pisaOcupado(desde, hasta, ocupados) : false;
  const tope = Math.max(1, Math.min(maxHuespedes ?? 16, 30));

  return (
    <div className="mt-5">
      {/* Fechas y huespedes */}
      <div className="overflow-hidden rounded-campo border border-gris-200">
        <div className="grid grid-cols-2 divide-x divide-gris-200">
          {[
            { rotulo: "Llegada", valor: desde },
            { rotulo: "Salida", valor: hasta },
          ].map((c) => (
            <button key={c.rotulo} type="button" onClick={irAlCalendario} className="px-4 py-3 text-left transition-colors hover:bg-gris-50">
              <span className="block font-rotulo text-[10px] tracking-[0.1em] text-texto-2 uppercase">{c.rotulo}</span>
              <span className={cn("mt-1 block text-[15px] tabular-nums", !c.valor && "text-texto-2")}>{c.valor ? diaMes(c.valor) + "/" + c.valor.slice(2, 4) : "Elegir"}</span>
            </button>
          ))}
        </div>
        <label className="relative block border-t border-gris-200 px-4 py-3 transition-colors hover:bg-gris-50">
          <span className="block font-rotulo text-[10px] tracking-[0.1em] text-texto-2 uppercase">Huéspedes</span>
          <select
            value={huespedes ?? ""}
            onChange={(e) => ponerHuespedes(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full appearance-none bg-transparent pr-6 text-[15px] outline-none"
          >
            <option value="">Elegir</option>
            {Array.from({ length: tope }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "huésped" : "huéspedes"}
              </option>
            ))}
          </select>
          <Icono nombre="flecha-abajo" tamano={16} className="pointer-events-none absolute right-4 bottom-4 text-texto-2" />
        </label>
      </div>

      {/* Sin fechas: el proximo disponible. Con fechas: el desglose */}
      {!cot ? (
        <ProximoDisponible periodos={periodos} ocupados={ocupados} hoy={hoy} onElegir={(r) => ponerFechas(r.desde, r.hasta)} />
      ) : (
        <div className="mt-5 animate-entrada">
          {ocupadas && <p className="mb-3 rounded-campo bg-gris-50 px-3.5 py-2.5 text-[13px]">Algunas de esas noches figuran ocupadas. Podés consultar igual.</p>}
          {cot.total === null ? (
            <p className="text-[14px] text-texto-2">
              {textoNochesCorto(desde!, hasta!)} · {noches(cot.noches)}. El precio de estas fechas se consulta.
            </p>
          ) : (
            <dl className="flex flex-col gap-2.5 text-[15px]">
              {cot.detalle.map((d, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <dt className="text-texto-2">{d.tipo === "periodo" ? d.label : formatearMonto(d.monto, moneda) + " × " + noches(d.noches)}</dt>
                  <dd className="tabular-nums">{formatearMonto(d.tipo === "periodo" ? d.monto : d.monto * d.noches, moneda)}</dd>
                </div>
              ))}
              {limpieza !== null && limpieza > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-texto-2">Limpieza final</dt>
                  <dd className="tabular-nums">{formatearMonto(limpieza, moneda)}</dd>
                </div>
              )}
              <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-gris-200 pt-4">
                <dt className="font-medium">Total</dt>
                <dd className="font-titulo text-[20px] font-semibold tracking-[-0.02em] tabular-nums">{formatearMonto(total!, moneda)}</dd>
              </div>
              {deposito !== null && deposito > 0 && (
                <div className="flex justify-between gap-4 text-[13px] text-texto-2">
                  <dt>Depósito en garantía (se devuelve)</dt>
                  <dd className="tabular-nums">{formatearMonto(deposito, moneda)}</dd>
                </div>
              )}
            </dl>
          )}
          {minNoches && cot.noches < minNoches && <p className="mt-3 text-[13px] text-texto-2">La estadía mínima es de {noches(minNoches)}.</p>}
          <button type="button" onClick={() => ponerFechas(null, null)} className="mt-3 text-[13px] text-texto-2 underline-offset-2 hover:text-negro hover:underline">
            Cambiar fechas
          </button>
        </div>
      )}
    </div>
  );
}

// Barra de abajo en el celular: con fechas elegidas muestra el total y el rango.
export function PrecioBarra({
  slug,
  periodos,
  precioBase,
  moneda,
  limpieza,
  children,
}: {
  slug: string;
  periodos: PeriodoFicha[];
  precioBase: number | null;
  moneda: Moneda;
  limpieza: number | null;
  children: React.ReactNode; // el precio base, cuando no hay fechas
}) {
  const { desde, hasta } = useFechasDe(slug);
  const cot = desde && hasta ? cotizar(desde, hasta, periodos, precioBase) : null;
  if (!cot || cot.total === null) return <>{children}</>;
  return (
    <div className="shrink-0 leading-tight">
      <p className="font-titulo text-[17px] font-semibold tracking-[-0.02em] tabular-nums">{formatearMonto(cot.total + (limpieza ?? 0), moneda)}</p>
      <p className="text-[12px] text-texto-2 underline underline-offset-2">
        {textoNochesCorto(desde!, hasta!)} · {noches(cot.noches)}
      </p>
    </div>
  );
}
