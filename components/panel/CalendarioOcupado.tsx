"use client";
import { useMemo, useState } from "react";
import Boton from "@/components/ui/Boton";
import Icono from "@/components/ui/Icono";
import Rotulo from "@/components/ui/Rotulo";
import { DIAS_SEMANA, grillaMes, mesMas, nocheOcupada } from "@/lib/calendario";
import { cn } from "@/lib/cn";
import { estadoPeriodo, hoyArgentina, nochesEntre, nombreMes, normalizarRangos, restarRango, textoNoches, type Rango } from "@/lib/disponibilidad";

type PeriodoCorto = { label: string; startDate: string; endDate: string };

// Calendario para marcar las fechas ocupadas: se toca la entrada y despues la salida.
// Cada cambio se guarda solo. Con atajos para marcar o liberar un periodo entero.
export default function CalendarioOcupado({
  iniciales,
  periodos,
  onGuardar,
}: {
  iniciales: Rango[];
  periodos: PeriodoCorto[];
  onGuardar: (rangos: Rango[]) => Promise<{ ok: true; rangos: Rango[] } | { ok: false; error: string }>;
}) {
  const hoy = hoyArgentina();
  const [rangos, setRangos] = useState<Rango[]>(normalizarRangos(iniciales));
  const primerPeriodo = periodos.map((p) => p.startDate).filter((d) => d > hoy).sort()[0];
  const [mes, setMes] = useState((primerPeriodo ?? hoy).slice(0, 7));
  const [entrada, setEntrada] = useState<string | null>(null);
  const [elegido, setElegido] = useState<Rango | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const meses = useMemo(() => [mes, mesMas(mes, 1)], [mes]);

  async function guardar(nuevos: Rango[], texto: string) {
    const anterior = rangos;
    const normal = normalizarRangos(nuevos);
    setRangos(normal);
    setElegido(null);
    setEntrada(null);
    setGuardando(true);
    setError("");
    setAviso("");
    const r = await onGuardar(normal);
    setGuardando(false);
    if (!r.ok) {
      setRangos(anterior);
      setError(r.error);
      return;
    }
    setRangos(r.rangos);
    setAviso(texto);
  }

  function tocar(dia: string) {
    setError("");
    setAviso("");
    if (entrada === null) {
      // Tocar un dia ocupado elige ese tramo (para liberarlo)
      const tramo = rangos.find((r) => dia >= r.desde && dia < r.hasta);
      if (tramo) {
        setElegido(tramo);
        return;
      }
      setElegido(null);
      setEntrada(dia);
      return;
    }
    if (dia <= entrada) {
      setEntrada(dia);
      return;
    }
    setElegido({ desde: entrada, hasta: dia });
    setEntrada(null);
  }

  const enSeleccion = (dia: string) => Boolean(elegido && dia >= elegido.desde && dia < elegido.hasta);
  const elegidoOcupado = elegido ? rangos.some((r) => elegido.desde < r.hasta && r.desde < elegido.hasta) : false;
  const elegidoTodoOcupado = elegido ? rangos.some((r) => r.desde <= elegido.desde && r.hasta >= elegido.hasta) : false;

  return (
    <div>
      {/* Atajos por periodo */}
      {periodos.length > 0 && (
        <div className="mb-6">
          <Rotulo como="p">Atajos por período</Rotulo>
          <ul className="mt-3 divide-y divide-gris-200 rounded-card border border-gris-200">
            {periodos.map((p) => {
              const { estado } = estadoPeriodo(p, rangos, "0000-01-01");
              const r = { desde: p.startDate, hasta: p.endDate };
              return (
                <li key={p.label + p.startDate} className="flex items-center gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{p.label}</span>
                    <span className="block text-[13px] text-texto-2">
                      {estado === "libre" ? "Libre" : estado === "ocupado" ? "Alquilado completo" : "Alquilado en parte"} · {textoNoches(p.startDate, p.endDate)}
                    </span>
                  </span>
                  {estado !== "ocupado" && (
                    <Boton variante="secundario" tamano="chico" disabled={guardando} onClick={() => guardar([...rangos, r], p.label + ": alquilado completo.")}>
                      Alquilado
                    </Boton>
                  )}
                  {estado !== "libre" && (
                    <Boton variante="texto" disabled={guardando} onClick={() => guardar(restarRango(rangos, r), p.label + ": liberado.")}>
                      Liberar
                    </Boton>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <Rotulo como="p">Calendario</Rotulo>
        <div className="flex gap-1">
          <button type="button" aria-label="Mes anterior" onClick={() => setMes(mesMas(mes, -1))} disabled={mes <= hoy.slice(0, 7)} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100 disabled:opacity-30">
            <Icono nombre="flecha-izq" tamano={18} />
          </button>
          <button type="button" aria-label="Mes siguiente" onClick={() => setMes(mesMas(mes, 1))} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-gris-100">
            <Icono nombre="flecha-der" tamano={18} />
          </button>
        </div>
      </div>

      <div className="mt-2 grid gap-8 md:grid-cols-2">
        {meses.map((m, i) => (
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
                const ocupado = nocheOcupada(dia, rangos);
                const esEntrada = dia === entrada;
                const sel = enSeleccion(dia);
                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={pasado || guardando}
                    onClick={() => tocar(dia)}
                    aria-label={dia + (ocupado ? ", ocupado" : ", libre")}
                    aria-pressed={sel || esEntrada}
                    className={cn(
                      "relative mx-auto my-0.5 grid size-10 place-items-center rounded-full text-[14px] tabular-nums transition-colors duration-150",
                      pasado && "text-gris-400",
                      !pasado && !ocupado && !sel && !esEntrada && "hover:bg-gris-100",
                      ocupado && !sel && "bg-gris-200 text-texto-2 line-through",
                      sel && "bg-negro/85 text-blanco no-underline",
                      esEntrada && "bg-negro text-blanco",
                      dia === hoy && !sel && !esEntrada && "font-semibold",
                    )}
                  >
                    {Number(dia.slice(8))}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-texto-2">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full border border-gris-400" /> Libre
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-gris-200" /> Ocupado
        </span>
      </div>

      {/* Lo que se eligio y que hacer */}
      <div className="mt-5 min-h-[56px]" aria-live="polite">
        {entrada && <p className="text-[15px]">Entrada el {Number(entrada.slice(8))}. Ahora tocá el día de salida.</p>}
        {elegido && (
          <div className="flex flex-col gap-3 rounded-card bg-gris-50 p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-[15px]">
              <span className="font-medium">{textoNoches(elegido.desde, elegido.hasta)}</span>
              <span className="text-texto-2">
                {" "}
                · {nochesEntre(elegido.desde, elegido.hasta)} {nochesEntre(elegido.desde, elegido.hasta) === 1 ? "noche" : "noches"} · salida {Number(elegido.hasta.slice(8))}/{Number(elegido.hasta.slice(5, 7))}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {!elegidoTodoOcupado && (
                <Boton tamano="chico" disabled={guardando} onClick={() => guardar([...rangos, elegido], "Marcado como ocupado.")}>
                  Marcar ocupado
                </Boton>
              )}
              {elegidoOcupado && (
                <Boton variante="secundario" tamano="chico" disabled={guardando} onClick={() => guardar(restarRango(rangos, elegido), "Fechas liberadas.")}>
                  Liberar
                </Boton>
              )}
              <Boton variante="texto" onClick={() => setElegido(null)}>
                Cancelar
              </Boton>
            </div>
          </div>
        )}
        {!entrada && !elegido && (
          <p className={cn("text-[14px]", error ? "text-error" : aviso ? "text-ok" : "text-texto-2")}>
            {error || (guardando ? "Guardando…" : aviso || "Tocá el día de entrada y después el de salida para marcar lo ocupado. Tocá un día ocupado para liberarlo.")}
          </p>
        )}
      </div>
    </div>
  );
}

