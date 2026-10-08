// Traduce los filtros del listado entre la URL (/propiedades?operacion=venta&zona=carilo)
// y los valores de la base. Sirve en el servidor y en el navegador.
import { TIPOS, type Operacion, type Tipo } from "@/lib/etiquetas";

export const OPERACIONES_URL = [
  { url: "temporario", valor: "ALQUILER_TEMPORARIO", etiqueta: "Alquilar", titulo: "Alquiler temporario" },
  { url: "anual", valor: "ALQUILER_ANUAL", etiqueta: "Anual", titulo: "Alquiler anual" },
  { url: "venta", valor: "VENTA", etiqueta: "Comprar", titulo: "Venta" },
] as const satisfies readonly { url: string; valor: Operacion; etiqueta: string; titulo: string }[];

export type OperacionUrl = (typeof OPERACIONES_URL)[number]["url"];

export const ORDENES = [
  { url: "", etiqueta: "Destacadas primero" },
  { url: "nuevas", etiqueta: "Más nuevas" },
  { url: "precio-asc", etiqueta: "Menor precio" },
  { url: "precio-desc", etiqueta: "Mayor precio" },
] as const;

// Distancias al mar que se pueden elegir (en metros, "hasta").
export const DISTANCIAS_MAR = [
  { url: "300", etiqueta: "300 m" },
  { url: "500", etiqueta: "500 m" },
  { url: "1000", etiqueta: "1 km" },
] as const;

// Cuantas propiedades se muestran por tanda ("Ver más" suma otra tanda).
export const POR_TANDA = 24;
const MAX_VER = POR_TANDA * 10;

// Lo que viaja en la URL, ya validado. Vacio = sin ese filtro.
export type Busqueda = {
  operacion: OperacionUrl | "";
  zona: string;
  tipo: string; // "casa", "departamento"...
  dorm: string; // "1".."4"
  pileta: boolean;
  mascotas: boolean;
  orden: string;
  // "Más filtros"
  moneda: "usd" | "ars" | "";
  pmin: string; // solo digitos
  pmax: string;
  banos: string; // "1".."3"
  cochera: boolean;
  mar: string; // "300" | "500" | "1000"
  com: string[]; // slugs de comodidades
  ver: number; // cuantas se muestran (multiplo de POR_TANDA)
};

const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function leerBusqueda(sp: Record<string, string | string[] | undefined>): Busqueda {
  const operacion = OPERACIONES_URL.find((o) => o.url === uno(sp.operacion))?.url ?? "";
  const tipo = TIPOS.find((t) => t.valor.toLowerCase() === uno(sp.tipo))?.valor.toLowerCase() ?? "";
  const dorm = /^[1-4]$/.test(uno(sp.dorm)) ? uno(sp.dorm) : "";
  const orden = ORDENES.find((o) => o.url && o.url === uno(sp.orden))?.url ?? "";
  return {
    operacion,
    zona: /^[a-z0-9-]{1,60}$/.test(uno(sp.zona)) ? uno(sp.zona) : "",
    tipo,
    dorm,
    pileta: uno(sp.pileta) === "1",
    mascotas: uno(sp.mascotas) === "1",
    orden,
    moneda: uno(sp.moneda) === "usd" || uno(sp.moneda) === "ars" ? (uno(sp.moneda) as "usd" | "ars") : "",
    pmin: monto(uno(sp.pmin)),
    pmax: monto(uno(sp.pmax)),
    banos: /^[1-3]$/.test(uno(sp.banos)) ? uno(sp.banos) : "",
    cochera: uno(sp.cochera) === "1",
    mar: DISTANCIAS_MAR.find((d) => d.url === uno(sp.mar))?.url ?? "",
    com: [...new Set(uno(sp.com).split(",").filter((c) => /^[a-z0-9-]{1,40}$/.test(c)))].slice(0, 12).sort(),
    ver: ver(uno(sp.ver)),
  };
}

// Monto de la URL: solo digitos, sin ceros adelante, hasta 12 cifras.
const monto = (v: string) => (/^\d{1,12}$/.test(v) && Number(v) > 0 ? String(Number(v)) : "");

function ver(v: string): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= POR_TANDA) return POR_TANDA;
  return Math.min(Math.ceil(n / POR_TANDA) * POR_TANDA, MAX_VER);
}

// Cuantos filtros de "Más filtros" estan puestos (para el numerito de la pastilla).
export function filtrosExtra(b: Busqueda): number {
  return [b.pmin || b.pmax || b.moneda, b.banos, b.cochera, b.mar].filter(Boolean).length + b.com.length;
}

export function urlDeBusqueda(b: Partial<Busqueda>): string {
  const q = new URLSearchParams();
  if (b.operacion) q.set("operacion", b.operacion);
  if (b.zona) q.set("zona", b.zona);
  if (b.tipo) q.set("tipo", b.tipo);
  if (b.dorm) q.set("dorm", b.dorm);
  if (b.pileta) q.set("pileta", "1");
  if (b.mascotas) q.set("mascotas", "1");
  if (b.orden) q.set("orden", b.orden);
  if (b.moneda) q.set("moneda", b.moneda);
  if (b.pmin) q.set("pmin", b.pmin);
  if (b.pmax) q.set("pmax", b.pmax);
  if (b.banos) q.set("banos", b.banos);
  if (b.cochera) q.set("cochera", "1");
  if (b.mar) q.set("mar", b.mar);
  if (b.com?.length) q.set("com", [...b.com].sort().join(","));
  if (b.ver && b.ver > POR_TANDA) q.set("ver", String(b.ver));
  const s = q.toString();
  return "/propiedades" + (s ? "?" + s : "");
}

export const operacionDeUrl = (url: string): Operacion | undefined => OPERACIONES_URL.find((o) => o.url === url)?.valor;
export const tipoDeUrl = (url: string): Tipo | undefined => TIPOS.find((t) => t.valor.toLowerCase() === url)?.valor;

// "8 huéspedes · 4 dorm. · 3 baños" segun lo que tenga cargado la propiedad.
export function datosClave(p: {
  type: string;
  operation: string;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  coveredM2: number | null;
  lotM2: number | null;
}): string {
  const d: string[] = [];
  if (p.type === "LOTE") {
    if (p.lotM2) d.push(p.lotM2.toLocaleString("es-AR") + " m² de lote");
    return d.join(" · ");
  }
  if (p.operation === "ALQUILER_TEMPORARIO" && p.maxGuests) d.push(p.maxGuests + (p.maxGuests === 1 ? " huésped" : " huéspedes"));
  if (p.bedrooms) d.push(p.bedrooms + " dorm.");
  if (p.bathrooms) d.push(p.bathrooms + (p.bathrooms === 1 ? " baño" : " baños"));
  if (p.operation !== "ALQUILER_TEMPORARIO" && p.coveredM2) d.push(p.coveredM2.toLocaleString("es-AR") + " m²");
  return d.join(" · ");
}
