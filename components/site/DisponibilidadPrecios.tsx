"use client";
import { useEffect, useRef, useState } from "react";
import {
  avisarEvento,
  HojaConsulta,
  type PropiedadConsulta,
} from "@/components/site/Consultar";
import Icono from "@/components/ui/Icono";
import { PastillaEstado } from "@/components/ui/Pastilla";
import { DIAS_SEMANA, grillaMes, mesMas, nocheOcupada } from "@/lib/calendario";
import { cn } from "@/lib/cn";
import {
  agruparPorMes,
  cotizar,
  diaMes,
  nochesEntre,
  nombreMes,
  periodosVigentes,
  pisaOcupado,
  textoNoches,
  textoNochesCorto,
  type Rango,
} from "@/lib/disponibilidad";
import {
  ETIQUETA_PERIODO,
  formatearMonto,
  type Moneda,
  type Periodo,
} from "@/lib/formato";
import { useFechasDe } from "@/store/fechas";

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

const FECHA = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "long",
});
const noches = (n: number) => n + (n === 1 ? " noche" : " noches");

// true cuando el elemento entra en pantalla (una sola vez): para animar la entrada de las tarjetas
function useAlVer<T extends Element>() {
  const ref = useRef<T>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visto]);
  return { ref, visto };
}

// Abre la consulta con unas fechas (la usan las tarjetas y la tarjeta de "Próximo disponible")
function useConsulta(propiedad: PropiedadConsulta, whatsapp: string | null) {
  const [elegido, setElegido] = useState<Eleccion | null>(null);
  const hoja = elegido && (
    <HojaConsulta
      propiedad={propiedad}
      whatsapp={whatsapp}
      onCerrar={() => setElegido(null)}
      onWhatsapp={() => avisarEvento(propiedad.slug, "whatsapp")}
      fechas={{
        desde: elegido.desde,
        hasta: elegido.hasta,
        periodo: elegido.periodo,
      }}
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
  precioBaseNoche,
  moneda,
  calendario,
}: {
  periodos: PeriodoFicha[];
  ocupados: Rango[];
  hoy: string;
  actualizada: string | null;
  precioBaseNoche: number | null; // precio base de la propiedad si es por noche (para noches fuera de los periodos)
  moneda: Moneda;
  calendario: boolean; // alquiler temporario: se pueden elegir fechas
  propiedad: PropiedadConsulta;
  whatsapp: string | null;
}) {
  const { abrir, hoja } = useConsulta(propiedad, whatsapp);
  const grupos = agruparPorMes(periodosVigentes(periodos, ocupados, hoy));
  const conFechas = periodos.some((p) => p.startDate);

  return (
    <>
      <div className="flex flex-col gap-8">
        {grupos.map((g) => (
          <GrupoMes key={g.clave} grupo={g} periodos={periodos} abrir={abrir} />
        ))}
      </div>

      {conFechas && (
        <p className="mt-6 text-[13px] text-texto-2">
          {actualizada
            ? "Disponibilidad actualizada el " +
              FECHA.format(new Date(actualizada)) +
              ". "
            : ""}
          Tocá un período o unas noches libres para consultar por esas fechas.
        </p>
      )}

      {calendario && (
        <div
          id="elegir-fechas"
          className={cn("scroll-mt-28", grupos.length ? "mt-10" : "")}
        >
          <h3 className="font-titulo text-[17px] font-semibold tracking-[-0.01em]">
            Elegí tus fechas
          </h3>
          <p className="mt-1 mb-4 text-[14px] text-texto-2">
            Tocá el día de entrada y el de salida. Te mostramos el total con el
            precio por noche de cada período.
          </p>
          <CalendarioFechas
            slug={propiedad.slug}
            ocupados={ocupados}
            hoy={hoy}
            desde={
              periodos
                .map((p) => p.startDate)
                .filter((d): d is string => Boolean(d && d > hoy))
                .sort()[0] ?? hoy
            }
            periodos={periodos}
            precioBase={precioBaseNoche}
            moneda={moneda}
            minimo={propiedad.minNights}
            onConsultar={(r) =>
              abrir({ ...r, periodo: textoNoches(r.desde, r.hasta) })
            }
          />
        </div>
      )}
      {hoja}
    </>
  );
}

// Calendario para elegir fechas: entrada y salida sobre los dias libres, con el total.
// (Cuando esten las reservas, aca va tambien "Reservar".)
function CalendarioFechas({
  slug,
  ocupados,
  hoy,
  desde,
  periodos,
  precioBase,
  moneda,
  minimo,
  onConsultar,
}: {
  slug: string;
  ocupados: Rango[];
  hoy: string;
  desde: string;
  periodos: PeriodoFicha[];
  precioBase: number | null;
  moneda: Moneda;
  minimo: number | null;
  onConsultar: (r: Rango) => void;
}) {
  const elegidas = useFechasDe(slug);
  const [mes, setMes] = useState((elegidas.desde ?? desde).slice(0, 7));
  // "nueva": entrada tocada esperando la salida. Si no hay, se muestra lo elegido (compartido con la tarjeta de la derecha)
  const [nueva, setNueva] = useState<string | null>(null);
  const entrada = nueva ?? elegidas.desde;
  const salida = nueva ? null : elegidas.hasta;
  const [cursor, setCursor] = useState<string | null>(null);
  const [aviso, setAviso] = useState("");
  const setEntrada = (dia: string) => setNueva(dia);
  const setSalida = (dia: string) => {
    elegidas.ponerFechas(entrada, dia);
    setNueva(null);
  };

  // Rango que se ve marcado: el elegido, o el que se esta por elegir (mouse encima)
  const hasta =
    salida ?? (entrada && cursor && cursor > entrada ? cursor : null);
  const enRango = (dia: string) =>
    Boolean(entrada && hasta && dia > entrada && dia < hasta);
  const cruzaOcupado = (a: string, b: string) => pisaOcupado(a, b, ocupados);

  function tocar(dia: string) {
    setAviso("");
    const libre = !nocheOcupada(dia, ocupados);
    if (!entrada || salida) {
      if (!libre)
        return setAviso(
          "Esa noche está ocupada. Elegí un día libre para entrar.",
        );
      setEntrada(dia);
      return;
    }
    if (dia <= entrada) {
      if (!libre)
        return setAviso(
          "Esa noche está ocupada. Elegí un día libre para entrar.",
        );
      setEntrada(dia);
      return;
    }
    // La salida puede ser un dia ocupado (ese dia entra otro), pero no puede haber noches ocupadas en el medio
    if (cruzaOcupado(entrada, dia))
      return setAviso(
        "Entre esas fechas hay noches ocupadas. Elegí otra salida.",
      );
    setSalida(dia);
  }

  const cotizacion =
    entrada && salida ? cotizar(entrada, salida, periodos, precioBase) : null;
  const corto = cotizacion && minimo && cotizacion.noches < minimo;

  return (
    <div className="rounded-card border border-gris-200 p-4 md:p-6">
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          aria-label="Mes anterior"
          onClick={() => setMes(mesMas(mes, -1))}
          disabled={mes <= hoy.slice(0, 7)}
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100 disabled:opacity-30"
        >
          <Icono nombre="flecha-izq" tamano={18} />
        </button>
        <button
          type="button"
          aria-label="Mes siguiente"
          onClick={() => setMes(mesMas(mes, 1))}
          className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100"
        >
          <Icono nombre="flecha-der" tamano={18} />
        </button>
      </div>
      <div
        className="grid gap-8 md:grid-cols-2"
        onMouseLeave={() => setCursor(null)}
      >
        {[mes, mesMas(mes, 1)].map((m, i) => (
          <div key={m} className={cn(i === 1 && "hidden md:block")}>
            <p className="mb-3 font-titulo text-[16px] font-semibold tracking-[-0.01em]">
              {nombreMes(m + "-01")}
            </p>
            <div className="grid grid-cols-7 text-center">
              {DIAS_SEMANA.map((d, j) => (
                <span
                  key={j}
                  className="pb-2 font-rotulo text-[10px] tracking-[0.08em] text-texto-2"
                >
                  {d}
                </span>
              ))}
              {grillaMes(m).map((dia, j) => {
                if (!dia) return <span key={j} />;
                const pasado = dia < hoy;
                const ocupado = nocheOcupada(dia, ocupados);
                const extremo = dia === entrada || dia === hasta;
                const medio = enRango(dia);
                // Un dia ocupado solo se puede tocar como salida
                const tocable =
                  !pasado &&
                  (!ocupado || Boolean(entrada && !salida && dia > entrada));
                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={!tocable}
                    onClick={() => tocar(dia)}
                    onMouseEnter={() => setCursor(dia)}
                    aria-label={
                      dia + (pasado ? "" : ocupado ? ", ocupado" : ", libre")
                    }
                    aria-pressed={extremo}
                    className={cn(
                      "relative my-0.5 grid h-10 place-items-center text-[14px] tabular-nums transition-colors duration-150",
                      medio && "bg-gris-100",
                      dia === entrada && hasta && "rounded-l-full bg-gris-100",
                      dia === hasta && "rounded-r-full bg-gris-100",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full",
                        pasado && "text-gris-400",
                        !pasado &&
                          ocupado &&
                          !extremo &&
                          "text-gris-400 line-through",
                        !pasado && !ocupado && !extremo && "hover:bg-gris-100",
                        extremo && "bg-negro text-blanco no-underline",
                        (dia === entrada || dia === salida) &&
                          "animate-[marca_0.35s_var(--ease-app)]",
                      )}
                    >
                      {Number(dia.slice(8))}
                    </span>
                  </button>
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
          <span className="text-gris-400 line-through">12</span> Ocupado
        </span>
      </div>

      <div
        className="mt-5 min-h-[64px] border-t border-gris-200 pt-5"
        aria-live="polite"
      >
        {aviso ? (
          <p key={aviso} className="animate-entrada text-[14px] text-error">
            {aviso}
          </p>
        ) : entrada && salida && cotizacion ? (
          <div
            key={entrada + salida}
            className="flex animate-entrada flex-col gap-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-[16px] font-medium">
                {textoNoches(entrada, salida)} · {noches(cotizacion.noches)}
              </p>
              <p className="mt-0.5 text-[14px] text-texto-2">
                {cotizacion.total !== null ? (
                  <>
                    <span className="font-titulo text-[18px] font-semibold tracking-[-0.02em] text-negro tabular-nums">
                      {formatearMonto(cotizacion.total, moneda)}
                    </span>{" "}
                    en total · salida {diaMes(salida)}
                  </>
                ) : (
                  "Precio a consultar · salida " + diaMes(salida)
                )}
              </p>
              {corto && (
                <p className="mt-1 text-[13px] text-texto-2">
                  La estadía mínima es de {noches(minimo!)}. Podés consultar
                  igual.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (
                  setNueva(null),
                  elegidas.ponerFechas(null, null)
                )}
                className="text-[14px] text-texto-2 hover:text-negro"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => onConsultar({ desde: entrada, hasta: salida })}
                className="inline-flex h-11 items-center rounded-pastilla bg-negro px-5 text-[14px] font-medium text-blanco transition-transform duration-200 ease-app active:scale-[0.97]"
              >
                Consultar estas fechas
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[14px] text-texto-2">
            {entrada
              ? "Entrada el " +
                diaMes(entrada) +
                ". Ahora tocá el día de salida."
              : "Elegí el día de entrada."}
          </p>
        )}
      </div>
    </div>
  );
}

// Tarjeta de precio (compu): el proximo periodo o las proximas noches libres.
export function ProximoDisponible({
  periodos,
  ocupados,
  hoy,
  onElegir,
}: {
  periodos: PeriodoFicha[];
  ocupados: Rango[];
  hoy: string;
  onElegir: (r: Rango) => void;
}) {
  const vigentes = periodosVigentes(
    periodos.filter((p) => p.startDate && p.endDate),
    ocupados,
    hoy,
  )
    .filter((p) => p.estado !== "ocupado")
    .sort((a, b) =>
      a.startDate! < b.startDate!
        ? -1
        : a.startDate === b.startDate
          ? nochesEntre(a.startDate!, a.endDate!) -
            nochesEntre(b.startDate!, b.endDate!)
          : 1,
    );
  const p = vigentes[0];
  if (!p) return null;
  const tramo =
    p.estado === "libre"
      ? { desde: p.startDate!, hasta: p.endDate! }
      : p.libres[0];
  const n = nochesEntre(tramo.desde, tramo.hasta);
  const precio =
    p.estado === "libre"
      ? formatearMonto(p.amount, p.currency)
      : p.dailyAmount !== null
        ? formatearMonto(p.dailyAmount * n, p.currency)
        : null;

  return (
    <div
      key={p.id + tramo.desde}
      className="mt-5 animate-entrada rounded-card bg-gris-50 p-4"
    >
      <p className="font-rotulo text-[10px] tracking-[0.1em] text-texto-2 uppercase">
        Próximo disponible
      </p>
      <p className="mt-2 text-[15px] font-medium">
        {p.estado === "libre" ? p.label : "Noches sueltas · " + p.label}
      </p>
      <p className="mt-0.5 text-[13px] text-texto-2">
        {textoNoches(tramo.desde, tramo.hasta)} · {noches(n)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        {precio && (
          <p className="font-titulo text-[18px] font-semibold tracking-[-0.02em] tabular-nums">
            {precio}
          </p>
        )}
        <button
          type="button"
          onClick={() => onElegir(tramo)}
          className="text-[14px] font-medium text-link hover:opacity-70"
        >
          Elegir estas fechas
        </button>
      </div>
    </div>
  );
}

// Un mes con sus tarjetas. Entran escalonadas cuando aparecen en pantalla.
function GrupoMes({
  grupo: g,
  periodos,
  abrir,
}: {
  grupo: {
    titulo: string;
    periodos: ReturnType<typeof periodosVigentes<PeriodoFicha>>;
  };
  periodos: PeriodoFicha[];
  abrir: (e: Eleccion) => void;
}) {
  const { ref, visto } = useAlVer<HTMLUListElement>();
  return (
    <div>
      <h3 className="mb-3 font-titulo text-[17px] font-semibold tracking-[-0.01em]">
        {g.titulo}
      </h3>
      <ul
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden"
      >
        {g.periodos.map((p, i) => {
          const tieneFechas = Boolean(p.startDate && p.endDate);
          const ocupado = p.estado === "ocupado";
          const parcial = p.estado === "parcial";
          // Un mes que contiene sus quincenas no repite las noches libres: ya figuran en ellas
          const contieneOtros = periodos.some(
            (q) =>
              q.id !== p.id &&
              q.startDate &&
              q.endDate &&
              p.startDate &&
              p.endDate &&
              q.startDate >= p.startDate &&
              q.endDate <= p.endDate,
          );
          return (
            <li
              key={p.id}
              className={cn(
                "w-[78%] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none",
                visto ? "animate-entrada" : "opacity-0",
              )}
              style={
                visto
                  ? { animationDelay: Math.min(i, 6) * 70 + "ms" }
                  : undefined
              }
            >
              <article
                className={cn(
                  "group flex h-full flex-col rounded-card border p-5 transition-[transform,border-color] duration-300 ease-app",
                  ocupado
                    ? "border-transparent bg-gris-50"
                    : "border-gris-200 bg-blanco md:hover:-translate-y-1 md:hover:border-gris-400",
                )}
              >
                <h4 className="font-titulo text-[18px] leading-snug font-semibold tracking-[-0.02em]">
                  {p.label}
                </h4>
                {tieneFechas && (
                  <p className="mt-1.5 text-[13px] leading-snug text-texto-2">
                    {textoNoches(p.startDate!, p.endDate!)} · salida{" "}
                    {diaMes(p.endDate!)} ·{" "}
                    {noches(nochesEntre(p.startDate!, p.endDate!))}
                  </p>
                )}
                <p
                  className={cn(
                    "mt-5 origin-left font-titulo text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums transition-transform duration-300 ease-app",
                    !ocupado && "md:group-hover:scale-[1.04]",
                    (ocupado || parcial) &&
                      "text-texto-2 line-through decoration-1",
                  )}
                >
                  {formatearMonto(p.amount, p.currency)}
                </p>
                <p className="mt-2 text-[13px] leading-snug text-texto-2">
                  {ETIQUETA_PERIODO[p.period]
                    ? "por " + ETIQUETA_PERIODO[p.period]
                    : "total"}
                  {p.minNights ? " · mín. " + noches(p.minNights) : ""}
                </p>
                {p.dailyAmount !== null && !ocupado && (
                  <p className="mt-1 text-[14px] font-medium tabular-nums">
                    {formatearMonto(p.dailyAmount, p.currency)}{" "}
                    <span className="font-normal text-texto-2">por noche</span>
                  </p>
                )}

                {parcial && contieneOtros && (
                  <p className="mt-5 text-[13px] leading-relaxed text-texto-2">
                    No se alquila completo. Las noches libres figuran en los
                    otros períodos.
                  </p>
                )}
                {parcial && !contieneOtros && (
                  <div className="mt-5">
                    <p className="text-[13px] font-medium">
                      Quedan noches libres
                    </p>
                    <ul className="mt-2 flex flex-col gap-2">
                      {p.libres.map((l, j) => {
                        const n = nochesEntre(l.desde, l.hasta);
                        return (
                          <li
                            key={l.desde}
                            className={visto ? "animate-entrada" : "opacity-0"}
                            style={
                              visto
                                ? {
                                    animationDelay:
                                      Math.min(i, 6) * 70 + 180 + j * 60 + "ms",
                                  }
                                : undefined
                            }
                          >
                            <button
                              type="button"
                              onClick={() =>
                                abrir({
                                  ...l,
                                  periodo:
                                    p.label +
                                    " (" +
                                    textoNoches(l.desde, l.hasta) +
                                    ")",
                                })
                              }
                              className="flex w-full items-center justify-between gap-3 rounded-campo bg-gris-50 px-3.5 py-2.5 text-left text-[14px] transition-[background-color,transform] duration-200 ease-app hover:bg-gris-100 active:scale-[0.98]"
                            >
                              <span>
                                {textoNochesCorto(l.desde, l.hasta)} ·{" "}
                                {noches(n)}
                              </span>
                              <span className="shrink-0 font-medium text-link tabular-nums">
                                {p.dailyAmount !== null
                                  ? formatearMonto(
                                      p.dailyAmount * n,
                                      p.currency,
                                    )
                                  : "Consultar"}
                              </span>
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
                    <PastillaEstado tono="ok" punto latido>
                      Disponible
                    </PastillaEstado>
                  )}
                  {p.estado === "libre" && tieneFechas && (
                    <button
                      type="button"
                      onClick={() =>
                        abrir({
                          desde: p.startDate!,
                          hasta: p.endDate!,
                          periodo: p.label,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[14px] font-medium text-link transition-opacity hover:opacity-70"
                    >
                      Consultar
                      <Icono
                        nombre="flecha-der"
                        tamano={14}
                        className="transition-transform duration-300 ease-app md:group-hover:translate-x-1"
                      />
                    </button>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
