// Mapas (MapLibre + OpenFreeMap "Positron": gris claro, combina con el sitio y no necesita clave).
import { createHash } from "node:crypto";
export { CENTRO_PARTIDO, CENTRO_ZONA, ESTILO_MAPA, RADIO_APROXIMADO } from "@/lib/mapa-datos";

export type UbicacionPublica = { lat: number; lng: number; exacta: boolean };

// Lo que puede ver el publico. Si el dueño no eligio mostrar el punto exacto,
// se corre el centro hasta ~250 m en una direccion fija para esa propiedad
// (siempre la misma, asi no se puede "promediar" recargando) y se redondea.
export function ubicacionPublica(id: string, lat: number | null, lng: number | null, exacta: boolean): UbicacionPublica | null {
  if (lat === null || lng === null) return null;
  if (exacta) return { lat, lng, exacta: true };
  const h = createHash("sha256").update("ubicacion:" + id).digest();
  const angulo = (h[0] / 255) * 2 * Math.PI;
  const distancia = 120 + (h[1] / 255) * 130; // 120 a 250 m
  const dLat = (distancia * Math.cos(angulo)) / 111_320;
  const dLng = (distancia * Math.sin(angulo)) / (111_320 * Math.cos((lat * Math.PI) / 180));
  const r = (n: number) => Math.round(n * 1000) / 1000; // ~100 m de precision
  return { lat: r(lat + dLat), lng: r(lng + dLng), exacta: false };
}
