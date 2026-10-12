"use client";
import Boton from "@/components/ui/Boton";
import { Campo, CampoSelect } from "@/components/ui/Campo";
import { nochesEntre, temporadaSugerida } from "@/lib/disponibilidad";
import type { MonedaPrecio, PeriodoPrecio } from "@/lib/etiquetas";
import type { TarifaForm } from "@/lib/valores-propiedad";

const MAX_PERIODOS = 30;

// Cuanto sale la noche alquilando el periodo completo: referencia para poner
// un precio un poco mas alto a las noches sueltas.
function referenciaNoche(t: TarifaForm): string {
  const monto = Number(t.amount);
  const noches = t.startDate && t.endDate && t.endDate > t.startDate ? nochesEntre(t.startDate, t.endDate) : 0;
  if (!monto || !noches) return "Para las noches sueltas que queden libres.";
  const porNoche = Math.round(monto / noches).toLocaleString("es-AR");
  return "Completo sale " + t.currency + " " + porNoche + " por noche (" + noches + " noches). Para las sueltas conviene un poco más.";
}

// Periodos de temporada con su precio y su precio por noche (Enero, 1ra quincena…).
// Lo ocupado se marca aparte, por fechas (CalendarioOcupado).
// Lo usan el asistente del panel y el formulario del admin.
export default function EditorPeriodos({
  periodos,
  onChange,
  opciones,
  moneda,
  periodoPorDefecto,
}: {
  periodos: TarifaForm[];
  onChange: (periodos: TarifaForm[]) => void;
  opciones: readonly { valor: PeriodoPrecio; etiqueta: string }[];
  moneda: MonedaPrecio;
  periodoPorDefecto: PeriodoPrecio;
}) {
  const setUno = (i: number, cambios: Partial<TarifaForm>) => onChange(periodos.map((t, j) => (j === i ? { ...t, ...cambios } : t)));
  const vacio = (): TarifaForm => ({ label: "", period: periodoPorDefecto, amount: "", currency: moneda, startDate: "", endDate: "", dailyAmount: "" });
  const permitido = (p: PeriodoPrecio) => (opciones.some((o) => o.valor === p) ? p : periodoPorDefecto);

  // Suma los periodos de la temporada que todavia no esten (mismas fechas)
  function cargarTemporada() {
    const nuevos = temporadaSugerida()
      .filter((s) => !periodos.some((t) => t.startDate === s.startDate && t.endDate === s.endDate))
      .map((s) => ({ ...vacio(), label: s.label, startDate: s.startDate, endDate: s.endDate, period: permitido(s.period) }));
    onChange([...periodos, ...nuevos].slice(0, MAX_PERIODOS));
  }

  return (
    <div className="flex flex-col gap-4">
      {periodos.map((t, i) => (
        <div key={i} className="rounded-card border border-gris-200 bg-blanco p-4 md:p-5">
          <Campo etiqueta="Nombre" value={t.label} onChange={(e) => setUno(i, { label: e.target.value })} maxLength={80} placeholder="1ra quincena de enero" />
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Campo etiqueta="Entrada" value={t.startDate} onChange={(e) => setUno(i, { startDate: e.target.value })} type="date" />
            <Campo etiqueta="Salida" value={t.endDate} onChange={(e) => setUno(i, { endDate: e.target.value })} type="date" min={t.startDate || undefined} />
            <Campo etiqueta={"Precio (" + t.currency + ")"} value={t.amount} onChange={(e) => setUno(i, { amount: e.target.value })} type="number" inputMode="decimal" min={0} step="any" />
            <CampoSelect etiqueta="Por" value={t.period} onChange={(e) => setUno(i, { period: e.target.value as PeriodoPrecio })}>
              {opciones.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.etiqueta}
                </option>
              ))}
            </CampoSelect>
            <Campo
              className="col-span-2"
              etiqueta={"Precio por noche (" + t.currency + ")"}
              value={t.dailyAmount}
              onChange={(e) => setUno(i, { dailyAmount: e.target.value })}
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              ayuda={referenciaNoche(t)}
            />
          </div>
          <Boton variante="texto" className="mt-3 !text-error" onClick={() => onChange(periodos.filter((_, j) => j !== i))}>
            Quitar período
          </Boton>
        </div>
      ))}
      <div className="flex flex-wrap gap-3">
        <Boton variante="secundario" tamano="chico" onClick={cargarTemporada} disabled={periodos.length >= MAX_PERIODOS}>
          Cargar temporada de verano
        </Boton>
        <Boton variante="secundario" tamano="chico" onClick={() => onChange([...periodos, vacio()])} disabled={periodos.length >= MAX_PERIODOS}>
          Agregar período
        </Boton>
      </div>
    </div>
  );
}
