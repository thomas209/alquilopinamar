// Formatos compartidos: precios, periodos y codigo de propiedad.
export type Moneda = "ARS" | "USD";
export type Periodo = "NOCHE" | "SEMANA" | "QUINCENA" | "MES" | "TEMPORADA" | "TOTAL";

const numero = new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 });

// "USD 1.200" / "$ 850.000"
export function formatearMonto(monto: number, moneda: Moneda): string {
  return (moneda === "USD" ? "USD " : "$ ") + numero.format(monto);
}

// Texto que acompaña al precio. TOTAL (venta) no lleva nada.
export const ETIQUETA_PERIODO: Record<Periodo, string> = {
  NOCHE: "noche",
  SEMANA: "semana",
  QUINCENA: "quincena",
  MES: "mes",
  TEMPORADA: "temporada",
  TOTAL: "",
};

// 123 -> "AP-0123"
export function formatearCodigo(code: number): string {
  return "AP-" + String(code).padStart(4, "0");
}

// Fechas siempre en hora argentina (el servidor corre en UTC).
const ZONA = "America/Argentina/Buenos_Aires";
const fechaHora = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const fechaHoraAnio = new Intl.DateTimeFormat("es-AR", { timeZone: ZONA, day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const diaMes = new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", weekday: "short", day: "numeric", month: "short", year: "numeric" });

// "8 oct, 10:52" (con año si no es el actual)
export function formatearFechaHora(d: Date): string {
  const mismoAnio = d.getUTCFullYear() === new Date().getUTCFullYear();
  return (mismoAnio ? fechaHora : fechaHoraAnio).format(d);
}

// Fechas de estadia (columnas DATE, guardadas a medianoche UTC): "vie, 2 ene 2027"
export function formatearDia(d: Date): string {
  return diaMes.format(d);
}

// Noches entre dos fechas de estadia
export function noches(desde: Date, hasta: Date): number {
  return Math.round((hasta.getTime() - desde.getTime()) / 86_400_000);
}
