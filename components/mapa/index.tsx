"use client";
import dynamic from "next/dynamic";

// Mientras carga Leaflet: un bloque gris del mismo tamaño (la pagina no salta)
function Cargando() {
  return <div className="h-full w-full animate-pulse bg-gris-100" />;
}

export const MapaElegir = dynamic(() => import("./MapaLeaflet").then((m) => m.MapaElegirLeaflet), { ssr: false, loading: Cargando });
export const MapaVer = dynamic(() => import("./MapaLeaflet").then((m) => m.MapaVerLeaflet), { ssr: false, loading: Cargando });
export type { Punto } from "./MapaLeaflet";
