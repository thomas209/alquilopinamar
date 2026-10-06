// Valores posibles de una propiedad y como se le muestran a la gente.
// Son los mismos que los enums del schema de Prisma.
export const OPERACIONES = [
  { valor: "ALQUILER_TEMPORARIO", etiqueta: "Alquiler temporario", corta: "Temporario" },
  { valor: "ALQUILER_ANUAL", etiqueta: "Alquiler anual", corta: "Anual" },
  { valor: "VENTA", etiqueta: "Venta", corta: "Venta" },
] as const;

export const TIPOS = [
  { valor: "CASA", etiqueta: "Casa" },
  { valor: "DEPARTAMENTO", etiqueta: "Departamento" },
  { valor: "DUPLEX", etiqueta: "Dúplex" },
  { valor: "CABANA", etiqueta: "Cabaña" },
  { valor: "LOTE", etiqueta: "Lote" },
  { valor: "LOCAL", etiqueta: "Local" },
] as const;

export const ESTADOS = [
  { valor: "BORRADOR", etiqueta: "Borrador", tono: "neutro" },
  { valor: "EN_REVISION", etiqueta: "En revisión", tono: "neutro" },
  { valor: "PUBLICADA", etiqueta: "Publicada", tono: "ok" },
  { valor: "PAUSADA", etiqueta: "Pausada", tono: "neutro" },
  { valor: "RECHAZADA", etiqueta: "Rechazada", tono: "error" },
] as const;

export const PERIODOS = [
  { valor: "NOCHE", etiqueta: "Por noche" },
  { valor: "SEMANA", etiqueta: "Por semana" },
  { valor: "QUINCENA", etiqueta: "Por quincena" },
  { valor: "MES", etiqueta: "Por mes" },
  { valor: "TEMPORADA", etiqueta: "Por temporada" },
  { valor: "TOTAL", etiqueta: "Precio total" },
] as const;

export const MONEDAS = [
  { valor: "USD", etiqueta: "Dólares (USD)" },
  { valor: "ARS", etiqueta: "Pesos ($)" },
] as const;

export type Operacion = (typeof OPERACIONES)[number]["valor"];
export type Tipo = (typeof TIPOS)[number]["valor"];
export type Estado = (typeof ESTADOS)[number]["valor"];
export type PeriodoPrecio = (typeof PERIODOS)[number]["valor"];
export type MonedaPrecio = (typeof MONEDAS)[number]["valor"];

// Periodos de precio que tienen sentido para cada operacion (el primero es el de por defecto).
export const PERIODOS_POR_OPERACION: Record<Operacion, PeriodoPrecio[]> = {
  ALQUILER_TEMPORARIO: ["NOCHE", "SEMANA", "QUINCENA", "MES", "TEMPORADA"],
  ALQUILER_ANUAL: ["MES"],
  VENTA: ["TOTAL"],
};

export function etiquetaDe(lista: readonly { valor: string; etiqueta: string }[], valor: string): string {
  return lista.find((x) => x.valor === valor)?.etiqueta ?? valor;
}
