// Disponibilidad de alquiler temporario, como se alquila en la costa.
// Sin dependencias del servidor: lo usan la ficha, el panel y el admin.
//
// - Periodos: "Enero completo", "1ra quincena de enero"… con su precio y su precio
//   por noche. Los nombres los pone el propietario y son el titulo de cada tarjeta.
// - Fechas ocupadas: rangos que marca el propietario. Asi una quincena puede quedar
//   alquilada a medias y mostrar las noches sueltas que quedan libres.
//
// Fechas en texto "AAAA-MM-DD". "Hasta" es el dia de salida: esa noche no se cuenta,
// asi la 1ra quincena (1 → 16) y la 2da (16 → 1) no se pisan.

export type Rango = { desde: string; hasta: string };

const DIA = 86_400_000;
const aMs = (iso: string) => Date.parse(iso + "T00:00:00Z");
const aIso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const sumarDias = (iso: string, dias: number) => aIso(aMs(iso) + dias * DIA);
export const nochesEntre = (desde: string, hasta: string) => Math.max(0, Math.round((aMs(hasta) - aMs(desde)) / DIA));
const max = (a: string, b: string) => (a > b ? a : b);
const min = (a: string, b: string) => (a < b ? a : b);

// Ordena y junta los rangos que se pisan o se tocan.
export function normalizarRangos(rangos: Rango[]): Rango[] {
  const validos = rangos.filter((r) => r.desde && r.hasta && r.hasta > r.desde).sort((a, b) => (a.desde < b.desde ? -1 : 1));
  const juntos: Rango[] = [];
  for (const r of validos) {
    const ultimo = juntos[juntos.length - 1];
    if (ultimo && r.desde <= ultimo.hasta) ultimo.hasta = max(ultimo.hasta, r.hasta);
    else juntos.push({ ...r });
  }
  return juntos;
}

// Saca un rango de una lista (para liberar fechas).
export function restarRango(rangos: Rango[], quitar: Rango): Rango[] {
  const resto: Rango[] = [];
  for (const r of normalizarRangos(rangos)) {
    if (r.hasta <= quitar.desde || r.desde >= quitar.hasta) {
      resto.push(r);
      continue;
    }
    if (r.desde < quitar.desde) resto.push({ desde: r.desde, hasta: quitar.desde });
    if (r.hasta > quitar.hasta) resto.push({ desde: quitar.hasta, hasta: r.hasta });
  }
  return resto;
}

// Tramos libres dentro de [desde, hasta) dadas las fechas ocupadas.
export function libresEntre(desde: string, hasta: string, ocupados: Rango[]): Rango[] {
  const libres: Rango[] = [];
  let cursor = desde;
  for (const o of normalizarRangos(ocupados)) {
    if (o.hasta <= cursor) continue;
    if (o.desde >= hasta) break;
    if (o.desde > cursor) libres.push({ desde: cursor, hasta: min(o.desde, hasta) });
    cursor = max(cursor, o.hasta);
    if (cursor >= hasta) break;
  }
  if (cursor < hasta) libres.push({ desde: cursor, hasta });
  return libres;
}

export function pisaOcupado(desde: string, hasta: string, ocupados: Rango[]): boolean {
  return ocupados.some((r) => desde < r.hasta && r.desde < hasta);
}

export type EstadoPeriodo = "libre" | "parcial" | "ocupado";

type ConFechas = { startDate: string | null; endDate: string | null };

// Estado de un periodo: libre del todo, con noches sueltas, u ocupado.
// Lo que ya paso (antes de hoy) no cuenta como libre.
export function estadoPeriodo(p: ConFechas, ocupados: Rango[], hoy: string): { estado: EstadoPeriodo; libres: Rango[] } {
  if (!p.startDate || !p.endDate) return { estado: "libre", libres: [] };
  const desde = max(p.startDate, hoy);
  if (desde >= p.endDate) return { estado: "ocupado", libres: [] };
  const libres = libresEntre(desde, p.endDate, ocupados);
  if (libres.length === 0) return { estado: "ocupado", libres };
  const todo = libres.length === 1 && libres[0].desde === p.startDate && libres[0].hasta === p.endDate;
  return { estado: todo ? "libre" : "parcial", libres };
}

// Los periodos que todavia no terminaron, con su estado.
export function periodosVigentes<T extends ConFechas>(periodos: T[], ocupados: Rango[], hoy: string) {
  return periodos.filter((p) => !p.endDate || p.endDate > hoy).map((p) => ({ ...p, ...estadoPeriodo(p, ocupados, hoy) }));
}

const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const partes = (iso: string) => iso.split("-").map(Number) as [number, number, number];

export const nombreMes = (iso: string) => {
  const [a, m] = partes(iso);
  return MESES_LARGOS[m - 1].charAt(0).toUpperCase() + MESES_LARGOS[m - 1].slice(1) + " " + a;
};

// Agrupa por el mes en que empieza cada periodo (los sin fechas van al final).
export function agruparPorMes<T extends ConFechas>(periodos: T[]): { clave: string; titulo: string; periodos: T[] }[] {
  const grupos = new Map<string, T[]>();
  for (const p of periodos) {
    const clave = p.startDate ? p.startDate.slice(0, 7) : "zz";
    grupos.set(clave, [...(grupos.get(clave) ?? []), p]);
  }
  return [...grupos.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([clave, lista]) => ({ clave, titulo: clave === "zz" ? "Otras tarifas" : nombreMes(clave + "-01"), periodos: lista }));
}

// Noches de un rango, como se dice aca: "1 al 15 de enero", "28 de enero al 3 de febrero".
// (la ultima noche es el dia anterior a la salida)
export function textoNoches(desde: string, hasta: string): string {
  const ultima = sumarDias(hasta, -1);
  const [, m1, d1] = partes(desde);
  const [, m2, d2] = partes(ultima);
  if (desde === ultima) return d1 + " de " + MESES_LARGOS[m1 - 1];
  if (m1 === m2) return d1 + " al " + d2 + " de " + MESES_LARGOS[m1 - 1];
  return d1 + " de " + MESES_LARGOS[m1 - 1] + " al " + d2 + " de " + MESES_LARGOS[m2 - 1];
}

// "1 al 15 ene" (corto, para rotulos)
export function textoNochesCorto(desde: string, hasta: string): string {
  const ultima = sumarDias(hasta, -1);
  const [, m1, d1] = partes(desde);
  const [, m2, d2] = partes(ultima);
  if (desde === ultima) return d1 + " " + MESES[m1 - 1];
  if (m1 === m2) return d1 + " al " + d2 + " " + MESES[m1 - 1];
  return d1 + " " + MESES[m1 - 1] + " al " + d2 + " " + MESES[m2 - 1];
}

// "16/1"
export const diaMes = (iso: string) => {
  const [, m, d] = partes(iso);
  return d + "/" + m;
};

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

// Hoy en Argentina, "AAAA-MM-DD"
export function hoyArgentina(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}

// Huella de los periodos: si cambia al guardar, se actualiza "Actualizada el…"
export function huellaDisponibilidad(periodos: { label: string; startDate: Date | string | null; endDate: Date | string | null }[]): string {
  const f = (d: Date | string | null) => (d instanceof Date ? d.toISOString().slice(0, 10) : (d ?? ""));
  return periodos.map((p) => p.label + "|" + f(p.startDate) + "|" + f(p.endDate)).join(";");
}

// Valida rangos que llegan del navegador: fechas reales, salida despues de entrada,
// dentro de los proximos 3 años. Devuelve la lista normalizada o un error.
export function rangosValidos(valor: unknown, hoy: string): { ok: true; rangos: Rango[] } | { ok: false; error: string } {
  if (!Array.isArray(valor)) return { ok: false, error: "Faltan las fechas." };
  if (valor.length > 200) return { ok: false, error: "Demasiados rangos." };
  const limite = sumarDias(hoy, 365 * 3);
  const desdeMin = sumarDias(hoy, -400);
  const fecha = /^\d{4}-\d{2}-\d{2}$/;
  const rangos: Rango[] = [];
  for (const r of valor) {
    if (!r || typeof r !== "object") return { ok: false, error: "Fechas no válidas." };
    const { desde, hasta } = r as Record<string, unknown>;
    if (typeof desde !== "string" || typeof hasta !== "string" || !fecha.test(desde) || !fecha.test(hasta)) return { ok: false, error: "Fechas no válidas." };
    if (Number.isNaN(aMs(desde)) || Number.isNaN(aMs(hasta)) || aIso(aMs(desde)) !== desde || aIso(aMs(hasta)) !== hasta) return { ok: false, error: "Fechas no válidas." };
    if (hasta <= desde) return { ok: false, error: "La salida tiene que ser después de la entrada." };
    if (hasta > limite || desde < desdeMin) return { ok: false, error: "Las fechas están fuera de rango." };
    rangos.push({ desde, hasta });
  }
  return { ok: true, rangos: normalizarRangos(rangos) };
}

// ---------- Cotizacion por noche ----------

type ConPrecio = { label: string; startDate: string | null; endDate: string | null; dailyAmount: number | null; currency: string };

// Precio de una noche: el del periodo mas corto que la contiene (la quincena antes que el mes)
// que tenga precio por noche. Si ninguno, el precio base (si es por noche).
export function precioDeNoche(dia: string, periodos: ConPrecio[], base: number | null): { monto: number | null; periodo: string | null } {
  const candidatos = periodos
    .filter((p) => p.startDate && p.endDate && p.dailyAmount !== null && dia >= p.startDate && dia < p.endDate)
    .sort((a, b) => nochesEntre(a.startDate!, a.endDate!) - nochesEntre(b.startDate!, b.endDate!));
  if (candidatos[0]) return { monto: candidatos[0].dailyAmount, periodo: candidatos[0].label };
  return { monto: base, periodo: null };
}

// Total de una estadia noche por noche. Si a alguna noche le falta precio, total = null ("a consultar").
export function cotizar(desde: string, hasta: string, periodos: ConPrecio[], base: number | null): { noches: number; total: number | null } {
  let total = 0;
  const n = nochesEntre(desde, hasta);
  for (let i = 0; i < n; i++) {
    const { monto } = precioDeNoche(sumarDias(desde, i), periodos, base);
    if (monto === null) return { noches: n, total: null };
    total += monto;
  }
  return { noches: n, total };
}
