"use client";
import { useState } from "react";
import { avisarEvento, HojaConsulta, type PropiedadConsulta } from "@/components/site/Consultar";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { cn } from "@/lib/cn";
import { rangoCorto } from "@/lib/disponibilidad";
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
  isAvailable: boolean; // como lo marco el propietario
  disponible: boolean; // real: tambien es false si se pisa con uno alquilado
};

const FECHA = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "numeric", month: "long" });

// "Disponibilidad y precios" de la ficha: una tarjeta por periodo de temporada.
// En el celular se desliza de costado; en compu va en grilla.
// Tocar uno disponible abre la consulta con esas fechas.
export default function DisponibilidadPrecios({
  periodos,
  actualizada,
  propiedad,
  whatsapp,
}: {
  periodos: PeriodoFicha[];
  actualizada: string | null;
  propiedad: PropiedadConsulta;
  whatsapp: string | null;
}) {
  const [elegido, setElegido] = useState<PeriodoFicha | null>(null);
  const hayEstados = periodos.some((p) => p.startDate);

  return (
    <>
      <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
        {periodos.map((p) => {
          const consultable = p.disponible && Boolean(p.startDate && p.endDate);
          const contenido = (
            <>
              <Rotulo como="p">
                {p.startDate && p.endDate ? rangoCorto(p.startDate, p.endDate) : "Temporada"}
              </Rotulo>
              <h3 className="mt-3 font-titulo text-[19px] leading-snug font-semibold tracking-[-0.02em]">{p.label}</h3>
              <p className={cn("mt-5 font-titulo text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums", !p.disponible && "text-texto-2 line-through decoration-1")}>
                {formatearMonto(p.amount, p.currency)}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-texto-2">
                {ETIQUETA_PERIODO[p.period] ? "por " + ETIQUETA_PERIODO[p.period] : "total"}
                {p.dailyAmount ? " · " + formatearMonto(p.dailyAmount, p.currency) + " por día" : ""}
                {p.minNights ? " · mín. " + p.minNights + " noches" : ""}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                {p.disponible ? (
                  <PastillaEstado tono="ok" punto>
                    Disponible
                  </PastillaEstado>
                ) : (
                  <PastillaEstado tono="neutro">{p.isAvailable ? "No disponible" : "Alquilado"}</PastillaEstado>
                )}
                {consultable && <span className="text-[14px] font-medium text-link">Consultar</span>}
              </div>
            </>
          );
          const clases = "flex h-full w-full flex-col rounded-card border p-5 text-left transition-[border-color,transform,background-color] duration-200 ease-app";
          return (
            <li key={p.id} className="w-[74%] max-w-[300px] shrink-0 snap-start md:w-auto md:max-w-none">
              {consultable ? (
                <button type="button" onClick={() => setElegido(p)} className={cn(clases, "border-gris-200 bg-blanco hover:border-negro active:scale-[0.98]")} aria-label={"Consultar " + p.label}>
                  {contenido}
                </button>
              ) : (
                <div className={cn(clases, p.disponible ? "border-gris-200 bg-blanco" : "border-transparent bg-gris-50")}>{contenido}</div>
              )}
            </li>
          );
        })}
      </ul>
      {hayEstados && (
        <p className="mt-4 text-[13px] text-texto-2">
          {actualizada ? "Disponibilidad actualizada el " + FECHA.format(new Date(actualizada)) + ". " : ""}Tocá un período disponible para consultar por esas fechas.
        </p>
      )}

      {elegido && elegido.startDate && elegido.endDate && (
        <HojaConsulta
          propiedad={propiedad}
          whatsapp={whatsapp}
          onCerrar={() => setElegido(null)}
          onWhatsapp={() => avisarEvento(propiedad.slug, "whatsapp")}
          fechas={{ desde: elegido.startDate, hasta: elegido.endDate, periodo: elegido.label }}
        />
      )}
    </>
  );
}
