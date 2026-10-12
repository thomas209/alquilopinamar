// Destacados de la ficha: las 3 cosas que mas pesan al elegir en la costa,
// sacadas de los datos que ya cargo el propietario (no hay que escribir nada).
import type { NombreIcono } from "@/components/ui/Icono";

type Datos = {
  distanceToSeaM: number | null;
  hasPool: boolean;
  petsAllowed: boolean;
  maxGuests: number | null;
  operation: string;
  amenities: { slug: string }[];
};

export type Destacado = { icono: NombreIcono; titulo: string; detalle: string };

export function destacados(p: Datos): Destacado[] {
  const tiene = (slug: string) => p.amenities.some((a) => a.slug === slug);
  const lista: Destacado[] = [];
  if (p.distanceToSeaM !== null && p.distanceToSeaM <= 500) {
    lista.push({ icono: "mar", titulo: "A " + p.distanceToSeaM + " m del mar", detalle: "Vas a la playa caminando." });
  }
  if (tiene("pileta-climatizada")) lista.push({ icono: "pileta", titulo: "Pileta climatizada", detalle: "Se usa aunque refresque." });
  else if (p.hasPool) lista.push({ icono: "pileta", titulo: "Pileta", detalle: "Para los días de calor." });
  if (tiene("vista-al-mar")) lista.push({ icono: "atardecer", titulo: "Vista al mar", detalle: "Desde la propiedad." });
  if (p.petsAllowed) lista.push({ icono: "mascota", titulo: "Acepta mascotas", detalle: "Tu mascota también viene." });
  if (p.operation === "ALQUILER_TEMPORARIO" && p.maxGuests && p.maxGuests >= 6) {
    lista.push({ icono: "personas", titulo: "Para " + p.maxGuests + " personas", detalle: "Ideal para familias o grupos." });
  }
  if (tiene("parrilla")) lista.push({ icono: "fuego", titulo: "Parrilla", detalle: "Para el asado de la noche." });
  if (tiene("wifi")) lista.push({ icono: "wifi", titulo: "Wifi", detalle: "Para trabajar o mirar series." });
  return lista.slice(0, 3);
}
