// Disponibilidad por periodo (temporada), como se alquila en la costa:
// "Enero", "1ra Ene", "2da Ene"... cada uno con su precio y si esta alquilado.
// Sin dependencias del servidor: lo usan la ficha, el panel y el admin.
//
// Fechas en texto "AAAA-MM-DD". "Hasta" es el dia de salida (no se duerme esa noche),
// asi la 1ra quincena (1 → 16) y la 2da (16 → 1) no se pisan.

export type PeriodoDisponibilidad = {
  label: string;
  startDate: string | null;
  endDate: string | null;
  isAvailable: boolean;
};

const pisa = (a: { startDate: string | null; endDate: string | null }, b: { startDate: string | null; endDate: string | null }) =>
  Boolean(a.startDate && a.endDate && b.startDate && b.endDate && a.startDate < b.endDate && b.startDate < a.endDate);

// Disponible de verdad: marcado como disponible y sin pisarse con uno alquilado
// (si alquilaron la 1ra de enero, "Enero completo" ya no se puede).
export function disponibleEfectivo<T extends PeriodoDisponibilidad>(periodo: T, todos: T[]): boolean {
  if (!periodo.isAvailable) return false;
  return !todos.some((otro) => otro !== periodo && !otro.isAvailable && pisa(periodo, otro));
}

// Los que todavia no terminaron (o no tienen fechas), con su estado real.
export function periodosVigentes<T extends PeriodoDisponibilidad>(periodos: T[], hoy: string): (T & { disponible: boolean })[] {
  return periodos.filter((p) => !p.endDate || p.endDate > hoy).map((p) => ({ ...p, disponible: disponibleEfectivo(p, periodos) }));
}

// Rangos alquilados (para avisar en la consulta si eligen esas fechas)
export function rangosAlquilados(periodos: PeriodoDisponibilidad[]): { desde: string; hasta: string }[] {
  return periodos.filter((p) => !p.isAvailable && p.startDate && p.endDate).map((p) => ({ desde: p.startDate!, hasta: p.endDate! }));
}

export function pisaAlquilado(desde: string, hasta: string, alquilados: { desde: string; hasta: string }[]): boolean {
  return alquilados.some((r) => desde < r.hasta && r.desde < hasta);
}

// Temporada de verano armada de una: meses y quincenas de enero y febrero.
// Despues de marzo propone la del año que viene.
export function temporadaSugerida(hoy: Date = new Date()): { label: string; startDate: string; endDate: string; period: "MES" | "QUINCENA" }[] {
  const anio = hoy.getMonth() >= 2 ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const d = (m: number, dia: number) => anio + "-" + String(m).padStart(2, "0") + "-" + String(dia).padStart(2, "0");
  return [
    { label: "Enero completo", startDate: d(1, 1), endDate: d(2, 1), period: "MES" },
    { label: "1ra quincena de enero", startDate: d(1, 1), endDate: d(1, 16), period: "QUINCENA" },
    { label: "2da quincena de enero", startDate: d(1, 16), endDate: d(2, 1), period: "QUINCENA" },
    { label: "Febrero completo", startDate: d(2, 1), endDate: d(3, 1), period: "MES" },
    { label: "1ra quincena de febrero", startDate: d(2, 1), endDate: d(2, 16), period: "QUINCENA" },
    { label: "2da quincena de febrero", startDate: d(2, 16), endDate: d(3, 1), period: "QUINCENA" },
  ];
}

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2027-01-01" → "1 ene"
export function diaCorto(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return d + " " + MESES[m - 1];
}

// Rango legible: "1 → 16 ene" o "16 ene → 1 feb" (con año si no es el actual)
export function rangoCorto(desde: string, hasta: string, anioActual = new Date().getFullYear()): string {
  const [a1, m1] = desde.split("-").map(Number);
  const [a2, m2] = hasta.split("-").map(Number);
  const anio = a2 !== anioActual ? " " + a2 : "";
  if (a1 === a2 && m1 === m2) return Number(desde.slice(8)) + " → " + diaCorto(hasta) + anio;
  return diaCorto(desde) + (a1 !== a2 ? " " + a1 : "") + " → " + diaCorto(hasta) + anio;
}

// Hoy en Argentina, "AAAA-MM-DD"
export function hoyArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

// Huella de la disponibilidad: si cambia al guardar, se actualiza "Actualizado el…"
export function huellaDisponibilidad(periodos: { label: string; startDate: Date | string | null; endDate: Date | string | null; isAvailable: boolean }[]): string {
  const f = (d: Date | string | null) => (d instanceof Date ? d.toISOString().slice(0, 10) : (d ?? ""));
  return periodos.map((p) => p.label + "|" + f(p.startDate) + "|" + f(p.endDate) + "|" + (p.isAvailable ? 1 : 0)).join(";");
}
