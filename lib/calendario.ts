// Ayudas para dibujar calendarios mes a mes (semana de lunes a domingo).

export const DIAS_SEMANA = ["L", "M", "M", "J", "V", "S", "D"];

// Dias de un mes "AAAA-MM" en grilla de lunes a domingo (null = hueco)
export function grillaMes(mes: string): (string | null)[] {
  const [a, m] = mes.split("-").map(Number);
  const primero = new Date(Date.UTC(a, m - 1, 1));
  const dias = new Date(Date.UTC(a, m, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7;
  const celdas: (string | null)[] = Array.from({ length: hueco }, () => null);
  for (let d = 1; d <= dias; d++) celdas.push(mes + "-" + String(d).padStart(2, "0"));
  return celdas;
}

// "2027-01" + 1 → "2027-02"
export function mesMas(mes: string, n: number): string {
  const [a, m] = mes.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1 + n, 1)).toISOString().slice(0, 7);
}

// La noche de ese dia esta ocupada (el dia de salida no cuenta)
export const nocheOcupada = (dia: string, rangos: { desde: string; hasta: string }[]) => rangos.some((r) => dia >= r.desde && dia < r.hasta);
