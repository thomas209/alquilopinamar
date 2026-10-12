"use client";
import { useState } from "react";
import { avisarEvento, HojaConsulta, type PropiedadConsulta } from "@/components/site/Consultar";
import Icono from "@/components/ui/Icono";
import { PastillaEstado } from "@/components/ui/Pastilla";
import { DIAS_SEMANA, grillaMes, mesMas, nocheOcupada } from "@/lib/calendario";
import { cn } from "@/lib/cn";
import { agruparPorMes, diaMes, nochesEntre, nombreMes, periodosVigentes, textoNoches, textoNochesCorto, type Rango } from "@/lib/disponibilidad";
import { ETIQUETA_PERIODO, formatearMonto, type Moneda, type Periodo } from "@/lib/formato";

export type PeriodoFicha = {
  id: string;
  label: string;
  period: Periodo;
  amount: number;
  currency: Moneda;
  dailyAmount: number | null;
  minNights: number | null;
  startDate: string | null;
  endDate: string | null;
};

type Eleccion = { desde: string; hasta: string; periodo: string };

const FECHA = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "long" });
const noches = (n: number) => n + (n === 1 ? " noche" : " noches");

// Abre la consulta con unas fechas (la usan las tarjetas y la tarjeta de "Próximo disponible")
function useConsulta(propiedad: PropiedadConsulta, whatsapp: string | null) {
  const [elegido, setElegido] = useState<Eleccion | null>(null);
  const hoja = elegido && (
    <HojaConsulta
      propiedad={propiedad}
      whatsapp={whatsapp}
      onCerrar={() => setElegido(null)}
      onWhatsapp={() => avisarEvento(propiedad.slug, "whatsapp")}
      fechas={{ desde: elegido.desde, hasta: elegido.hasta, periodo: elegido.periodo }}
    />
  );
  return { abrir: setElegido, hoja };
}

// "Disponibilidad y precios" de la ficha: periodos agrupados por mes, con lo libre,
// las noches sueltas que quedan y lo alquilado. Abajo, el calendario.
export default function DisponibilidadPrecios({
  periodos,
  ocupados,
  hoy,
  actualizada,
  propiedad,
  whatsapp,
}: {
  periodos: PeriodoFicha[];
  ocupados: Rango[];
  hoy: string;
  actualizada: string | null;
  propiedad: PropiedadConsulta;
  whatsapp: string | null;
}) {
  const { abrir, hoja } = useConsulta(propiedad, whatsapp);
  const [verCalendario, setVerCalendario] = useState(false);
  const grupos = agruparPorMes(periodosVigentes(periodos, ocupados, hoy));
  const conFechas = periodos.some((p) => p.startDate);

  return (
    <>
      <div className="flex flex-col gap-8">
        {grupos.map((g) => (
          <div key={g.clave}>
            <h3 className="mb-3 font-titulo text-[17px] font-semibold tracking-[-0.01em]">{g.titulo}</h3>
            <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
              {g.periodos.map((p) => {
                const tieneFechas = Boolean(p.startDate && p.endDate);
                const ocupado = p.estado === "ocupado";
                const parcial = p.estado === "parcial";
                // Un mes que contiene sus quincenas no repite las noches libres: ya figuran en ellas
                const contieneOtros = periodos.some((q) => q.id !== p.id && q.startDate && q.endDate && p.startDate && p.endDate && q.startDate >= p.startDate && q.endDate <= p.endDate);
                return (
                  <li key={p.id} className="w-[78%] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none">
                    <article className={cn("flex h-full flex-col rounded-card border p-5", ocupado ? "border-transparent bg-gris-50" : "border-gris-200 bg-blanco")}>
                      <h4 className="font-titulo text-[18px] leading-snug font-semibold tracking-[-0.02em]">{p.label}</h4>
                      {tieneFechas && (
                        <p className="mt-1.5 text-[13px] leading-snug text-texto-2">
                          {textoNoches(p.startDate!, p.endDate!)} · salida {diaMes(p.endDate!)} · {noches(nochesEntre(p.startDate!, p.endDate!))}
                        </p>
                      )}
                      <p className={cn("mt-5 font-titulo text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums", (ocupado || parcial) && "text-texto-2 line-through decoration-1")}>
                        {formatearMonto(p.amount, p.currency)}
                      </p>
                      <p className="mt-2 text-[13px] leading-snug text-texto-2">
                        {ETIQUETA_PERIODO[p.period] ? "por " + ETIQUETA_PERIODO[p.period] : "total"}
                        {p.minNights ? " · mín. " + noches(p.minNights) : ""}
                      </p>
                      {p.dailyAmount !== null && !ocupado && (
                        <p className="mt-1 text-[14px] font-medium tabular-nums">
                          {formatearMonto(p.dailyAmount, p.currency)} <span className="font-normal text-texto-2">por noche</span>
                        </p>
                      )}

                      {parcial && contieneOtros && <p className="mt-5 text-[13px] leading-relaxed text-texto-2">No se alquila completo. Las noches libres figuran en los otros períodos.</p>}
                      {parcial && !contieneOtros && (
                        <div className="mt-5">
                          <p className="text-[13px] font-medium">Quedan noches libres</p>
                          <ul className="mt-2 flex flex-col gap-2">
                            {p.libres.map((l) => {
                              const n = nochesEntre(l.desde, l.hasta);
                              return (
                                <li key={l.desde}>
                                  <button
                                    type="button"
                                    onClick={() => abrir({ ...l, periodo: p.label + " (" + textoNoches(l.desde, l.hasta) + ")" })}
                                    className="flex w-full items-center justify-between gap-3 rounded-campo bg-gris-50 px-3.5 py-2.5 text-left text-[14px] transition-[background-color,transform] duration-200 ease-app hover:bg-gris-100 active:scale-[0.98]"
                                  >
                                    <span>
                                      {textoNochesCorto(l.desde, l.hasta)} · {noches(n)}
                                    </span>
                                    <span className="shrink-0 font-medium text-link tabular-nums">{p.dailyAmount !== null ? formatearMonto(p.dailyAmount * n, p.currency) : "Consultar"}</span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                        {ocupado ? (
                          <PastillaEstado tono="neutro">Alquilado</PastillaEstado>
                        ) : parcial ? (
                          <PastillaEstado tono="neutro" punto>
                            Alquilado en parte
                          </PastillaEstado>
                        ) : (
                          <PastillaEstado tono="ok" punto>
                            Disponible
                          </PastillaEstado>
                        )}
                        {p.estado === "libre" && tieneFechas && (
                          <button type="button" onClick={() => abrir({ desde: p.startDate!, hasta: p.endDate!, periodo: p.label })} className="text-[14px] font-medium text-link hover:opacity-70">
                            Consultar
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {conFechas && (
        <div className="mt-6 flex flex-col gap-4">
          <p className="text-[13px] text-texto-2">
            {actualizada ? "Disponibilidad actualizada el " + FECHA.format(new Date(actualizada)) + ". " : ""}Tocá un período o unas noches libres para consultar por esas fechas.
          </p>
          <button type="button" onClick={() => setVerCalendario((x) => !x)} aria-expanded={verCalendario} className="flex items-center gap-1.5 self-start text-[15px] font-medium text-link hover:opacity-70">
            {verCalendario ? "Ocultar calendario" : "Ver calendario"}
            <Icono nombre="flecha-abajo" tamano={16} className={cn("transition-transform duration-200", verCalendario && "rotate-180")} />
          </button>
          {verCalendario && <CalendarioPublico ocupados={ocupados} hoy={hoy} desde={periodos.map((p) => p.startDate).filter((d): d is string => Boolean(d && d > hoy)).sort()[0] ?? hoy} />}
        </div>
      )}
      {hoja}
    </>
  );
}

// Calendario de solo lectura: lo ocupado tachado en gris.
function CalendarioPublico({ ocupados, hoy, desde }: { ocupados: Rango[]; hoy: string; desde: string }) {
  const [mes, setMes] = useState(desde.slice(0, 7));
  return (
    <div className="animate-entrada rounded-card border border-gris-200 p-4 md:p-6">
      <div className="flex items-center justify-end gap-1">
        <button type="button" aria-label="Mes anterior" onClick={() => setMes(mesMas(mes, -1))} disabled={mes <= hoy.slice(0, 7)} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100 disabled:opacity-30">
          <Icono nombre="flecha-izq" tamano={18} />
        </button>
        <button type="button" aria-label="Mes siguiente" onClick={() => setMes(mesMas(mes, 1))} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100">
          <Icono nombre="flecha-der" tamano={18} />
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {[mes, mesMas(mes, 1)].map((m, i) => (
          <div key={m} className={cn(i === 1 && "hidden md:block")}>
            <p className="mb-3 font-titulo text-[16px] font-semibold tracking-[-0.01em]">{nombreMes(m + "-01")}</p>
            <div className="grid grid-cols-7 text-center">
              {DIAS_SEMANA.map((d, j) => (
                <span key={j} className="pb-2 font-rotulo text-[10px] tracking-[0.08em] text-texto-2">
                  {d}
                </span>
              ))}
              {grillaMes(m).map((dia, j) => {
                if (!dia) return <span key={j} />;
                const pasado = dia < hoy;
                const ocupado = nocheOcupada(dia, ocupados);
                return (
                  <span
                    key={dia}
                    aria-label={dia + (pasado ? "" : ocupado ? ", ocupado" : ", libre")}
                    className={cn("mx-auto my-0.5 grid size-9 place-items-center rounded-full text-[14px] tabular-nums", pasado ? "text-gris-400" : ocupado ? "bg-gris-100 text-gris-400 line-through" : "text-negro")}
                  >
                    {Number(dia.slice(8))}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-5 text-[13px] text-texto-2">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full border border-gris-400" /> Libre
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gris-100" /> Ocupado
        </span>
      </div>
    </div>
  );
}

// Tarjeta de precio (compu): el proximo periodo o las proximas noches libres.
export function ProximoDisponible({
  periodos,
  ocupados,
  hoy,
  propiedad,
  whatsapp,
}: {
  periodos: PeriodoFicha[];
  ocupados: Rango[];
  hoy: string;
  propiedad: PropiedadConsulta;
  whatsapp: string | null;
}) {
  const { abrir, hoja } = useConsulta(propiedad, whatsapp);
  const vigentes = periodosVigentes(
    periodos.filter((p) => p.startDate && p.endDate),
    ocupados,
    hoy,
  )
    .filter((p) => p.estado !== "ocupado")
    .sort((a, b) => (a.startDate! < b.startDate! ? -1 : a.startDate === b.startDate ? nochesEntre(a.startDate!, a.endDate!) - nochesEntre(b.startDate!, b.endDate!) : 1));
  const p = vigentes[0];
  if (!p) return null;
  const tramo = p.estado === "libre" ? { desde: p.startDate!, hasta: p.endDate! } : p.libres[0];
  const n = nochesEntre(tramo.desde, tramo.hasta);
  const precio = p.estado === "libre" ? formatearMonto(p.amount, p.currency) : p.dailyAmount !== null ? formatearMonto(p.dailyAmount * n, p.currency) : null;

  return (
    <div className="mt-5 rounded-card bg-gris-50 p-4">
      <p className="font-rotulo text-[10px] tracking-[0.1em] text-texto-2 uppercase">Próximo disponible</p>
      <p className="mt-2 text-[15px] font-medium">{p.estado === "libre" ? p.label : "Noches sueltas · " + p.label}</p>
      <p className="mt-0.5 text-[13px] text-texto-2">
        {textoNoches(tramo.desde, tramo.hasta)} · {noches(n)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        {precio && <p className="font-titulo text-[18px] font-semibold tracking-[-0.02em] tabular-nums">{precio}</p>}
        <button type="button" onClick={() => abrir({ ...tramo, periodo: p.estado === "libre" ? p.label : p.label + " (" + textoNoches(tramo.desde, tramo.hasta) + ")" })} className="text-[14px] font-medium text-link hover:opacity-70">
          Consultar estas fechas
        </button>
      </div>
      {hoja}
    </div>
  );
}
