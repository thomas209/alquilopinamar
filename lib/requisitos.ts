// Requisitos para publicar (docs/06-business-rules.md). Sin dependencias del
// servidor: los usan los endpoints y tambien el asistente del panel en el navegador.
export const MIN_FOTOS = 5;
export const MIN_FOTOS_LOTE = 3;
export const MIN_DESCRIPCION = 100;

export const minimoDeFotos = (tipo: string) => (tipo === "LOTE" ? MIN_FOTOS_LOTE : MIN_FOTOS);

// Lo que le falta a una propiedad para poder estar publicada. Lista vacia = puede publicarse.
export function faltaParaPublicar(p: {
  title: string;
  description: string;
  type: string;
  operation: string;
  price: unknown;
  priceOnRequest: boolean;
  maxGuests: number | null;
  fotos: number;
}): string[] {
  const falta: string[] = [];
  if (!p.title.trim()) falta.push("el título");
  if (p.description.trim().length < MIN_DESCRIPCION) falta.push("una descripción de al menos " + MIN_DESCRIPCION + " caracteres");
  if (!p.priceOnRequest && (p.price === null || p.price === undefined)) falta.push("el precio (o marcar “Consultar”)");
  if (p.operation === "ALQUILER_TEMPORARIO" && !p.maxGuests) falta.push("la cantidad de huéspedes");
  const minimo = minimoDeFotos(p.type);
  if (p.fotos < minimo) falta.push(minimo + " fotos como mínimo (tiene " + p.fotos + ")");
  return falta;
}

export function mensajeFalta(falta: string[]): string {
  return "Para publicarla falta: " + falta.join("; ") + ".";
}
