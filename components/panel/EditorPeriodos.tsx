"use client";
import Boton from "@/components/ui/Boton";
import { Campo, CampoSelect } from "@/components/ui/Campo";
import Segmentado from "@/components/ui/Segmentado";
import { temporadaSugerida } from "@/lib/disponibilidad";
import type { MonedaPrecio, PeriodoPrecio } from "@/lib/etiquetas";
import type { TarifaForm } from "@/lib/valores-propiedad";

const MAX_PERIODOS = 30;

// Periodos de temporada con precio y disponibilidad (Enero, 1ra Ene, 2da Ene…).
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
  const vacio = (): TarifaForm => ({ label: "", period: periodoPorDefecto, amount: "", currency: moneda, startDate: "", endDate: "", isAvailable: true, dailyAmount: "" });
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
        <div key={i} className={"rounded-card border bg-blanco p-4 transition-colors duration-200 md:p-5 " + (t.isAvailable ? "border-gris-200" : "border-negro/20")}>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
            <Campo etiqueta="Nombre" value={t.label} onChange={(e) => setUno(i, { label: e.target.value })} maxLength={80} placeholder="1ra quincena de enero" />
            <Segmentado
              etiqueta={"Estado de " + (t.label || "este período")}
              valor={t.isAvailable ? "si" : "no"}
              onChange={(x) => setUno(i, { isAvailable: x === "si" })}
              ancho
              opciones={[
                { valor: "si", etiqueta: "Disponible" },
                { valor: "no", etiqueta: "Alquilado" },
              ]}
            />
          </div>
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
            <Campo className="col-span-2 md:col-span-2" etiqueta="Valor por día (opcional)" value={t.dailyAmount} onChange={(e) => setUno(i, { dailyAmount: e.target.value })} type="number" inputMode="decimal" min={0} step="any" />
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
