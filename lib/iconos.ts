// Icono de cada comodidad, por su slug. Las que se creen desde el admin y no
// esten aca usan el tilde.
import type { NombreIcono } from "@/components/ui/Icono";

const POR_COMODIDAD: Record<string, NombreIcono> = {
  wifi: "wifi",
  parrilla: "fuego",
  "aire-acondicionado": "frio",
  calefaccion: "calor",
  "pileta-climatizada": "pileta",
  "cochera-cubierta": "garage",
  "ropa-blanca": "ropa-blanca",
  lavarropas: "lavarropas",
  seguridad: "seguridad",
  quincho: "quincho",
  jardin: "jardin",
  "vista-al-mar": "atardecer",
};

export const iconoDeComodidad = (slug: string): NombreIcono => POR_COMODIDAD[slug] ?? "check";
