"use client";
import dynamic from "next/dynamic";

// Mientras carga el mapa: un bloque gris del mismo tamaño (la pagina no salta)
function Cargando() {
  return <div className="h-full w-full animate-pulse bg-gris-100" />;
}

export const MapaElegir = dynamic(() => import("./MapaLibre").then((m) => m.MapaElegirLibre), { ssr: false, loading: Cargando });
export const MapaVer = dynamic(() => import("./MapaLibre").then((m) => m.MapaVerLibre), { ssr: false, loading: Cargando });
export const MapaPrecios = dynamic(() => import("./MapaLibre").then((m) => m.MapaPreciosLibre), { ssr: false, loading: Cargando });
export type { PinPrecio, Punto } from "./MapaLibre";
