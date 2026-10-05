import { cn } from "@/lib/cn";
import { ETIQUETA_PERIODO, formatearMonto, type Moneda, type Periodo } from "@/lib/formato";

// Precio con Instrument Sans y numeros parejos. Si no hay monto muestra "Consultar".
export default function Precio({
  monto,
  moneda = "USD",
  periodo = "TOTAL",
  tamano = "card",
  className,
}: {
  monto: number | null;
  moneda?: Moneda;
  periodo?: Periodo;
  tamano?: "card" | "ficha";
  className?: string;
}) {
  const etiqueta = ETIQUETA_PERIODO[periodo];
  return (
    <p className={cn("font-titulo font-medium tabular-nums text-negro", tamano === "card" ? "text-[15px]" : "text-[24px] tracking-[-0.02em]", className)}>
      {monto === null ? "Consultar" : formatearMonto(monto, moneda)}
      {monto !== null && etiqueta && (
        <span className={cn("font-sans font-normal text-texto-2", tamano === "card" ? "text-[13px]" : "text-[15px]")}> / {etiqueta}</span>
      )}
    </p>
  );
}
