"use client";
// Mapas con MapLibre + OpenFreeMap (estilo Positron: gris claro, gratis, sin clave).
// No importar directo: usar components/mapa/index.tsx (lo carga solo en el navegador).
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { CENTRO_PARTIDO, ESTILO_MAPA, RADIO_APROXIMADO } from "@/lib/mapa-datos";

// El worker se sirve desde public/vendor/ (lo copia scripts/maplibre-worker.mjs)
maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker-" + maplibregl.getVersion() + ".mjs");

export type Punto = { lat: number; lng: number };

// Textos en castellano de los controles
const TEXTOS = {
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "CooperativeGesturesHandler.WindowsHelpText": "Usá Ctrl + rueda para acercar o alejar el mapa",
  "CooperativeGesturesHandler.MacHelpText": "Usá ⌘ + rueda para acercar o alejar el mapa",
  "CooperativeGesturesHandler.MobileHelpText": "Usá dos dedos para mover el mapa",
};

// Pin propio: punto negro con borde blanco
function crearPin() {
  const el = document.createElement("span");
  el.style.cssText =
    "display:block;width:22px;height:22px;border-radius:999px;background:#0A0A0A;border:4px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.28);cursor:grab";
  return el;
}

// Poligono de un circulo de "radio" metros (MapLibre no tiene circulos en metros)
function circulo(lat: number, lng: number, radio: number): GeoJSON.Feature<GeoJSON.Polygon> {
  const pasos = 64;
  const dLat = radio / 111_320;
  const dLng = radio / (111_320 * Math.cos((lat * Math.PI) / 180));
  const anillo: [number, number][] = [];
  for (let i = 0; i <= pasos; i++) {
    const a = (i / pasos) * 2 * Math.PI;
    anillo.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [anillo] } };
}

function crearMapa(contenedor: HTMLDivElement, centro: [number, number], zoom: number, cooperativo: boolean) {
  const mapa = new maplibregl.Map({
    container: contenedor,
    style: ESTILO_MAPA,
    center: [centro[1], centro[0]],
    zoom,
    attributionControl: { compact: true },
    cooperativeGestures: cooperativo,
    dragRotate: false,
    pitchWithRotate: false,
    locale: TEXTOS,
  });
  mapa.touchZoomRotate.disableRotation();
  mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-left");
  return mapa;
}

// Admin: tocar el mapa (o arrastrar el pin) para marcar la propiedad.
export function MapaElegirLibre({ valor, centro, onChange }: { valor: Punto | null; centro: [number, number]; onChange: (p: Punto) => void }) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<maplibregl.Map | null>(null);
  const pin = useRef<maplibregl.Marker | null>(null);
  const alCambiar = useRef(onChange);
  useEffect(() => {
    alCambiar.current = onChange;
  });

  // Crear el mapa una sola vez
  useEffect(() => {
    if (!caja.current) return;
    const inicio = valor ? ([valor.lat, valor.lng] as [number, number]) : centro;
    const m = crearMapa(caja.current, inicio, valor ? 16 : 14, false);
    m.getCanvas().style.cursor = "crosshair";
    m.on("click", (e) => alCambiar.current({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    mapa.current = m;
    return () => {
      m.remove();
      mapa.current = null;
      pin.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el mapa se crea una vez; los cambios se aplican abajo
  }, []);

  // Pin segun el valor
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    if (!valor) {
      pin.current?.remove();
      pin.current = null;
      return;
    }
    if (!pin.current) {
      pin.current = new maplibregl.Marker({ element: crearPin(), draggable: true }).setLngLat([valor.lng, valor.lat]).addTo(m);
      pin.current.on("dragend", () => {
        const p = pin.current!.getLngLat();
        alCambiar.current({ lat: p.lat, lng: p.lng });
      });
    } else {
      pin.current.setLngLat([valor.lng, valor.lat]);
    }
  }, [valor]);

  // Sin punto marcado: seguir a la zona elegida
  const [cLat, cLng] = centro;
  useEffect(() => {
    if (!valor) mapa.current?.flyTo({ center: [cLng, cLat], zoom: 14, duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo cuando cambia la zona
  }, [cLat, cLng]);

  return <div ref={caja} className="h-full w-full" />;
}

// Ficha: punto exacto o circulo de zona aproximada. Gestos cooperativos:
// la pagina se scrollea por encima del mapa (con dos dedos o Ctrl/⌘ se mueve el mapa).
export function MapaVerLibre({ lat, lng, exacta }: { lat: number; lng: number; exacta: boolean }) {
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!caja.current) return;
    const m = crearMapa(caja.current, [lat, lng], exacta ? 16 : 14.5, true);
    if (exacta) {
      const el = crearPin();
      el.style.cursor = "default";
      new maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(m);
    } else {
      m.on("load", () => {
        m.addSource("zona", { type: "geojson", data: circulo(lat, lng, RADIO_APROXIMADO) });
        m.addLayer({ id: "zona-relleno", type: "fill", source: "zona", paint: { "fill-color": "#0A0A0A", "fill-opacity": 0.08 } });
        m.addLayer({ id: "zona-borde", type: "line", source: "zona", paint: { "line-color": "#0A0A0A", "line-opacity": 0.55, "line-width": 1.5 } });
      });
    }
    return () => m.remove();
  }, [lat, lng, exacta]);

  return <div ref={caja} className="h-full w-full" />;
}

// Listado en mapa: un pin con el precio por propiedad.
export type PinPrecio = { id: string; lat: number; lng: number; etiqueta: string };

const PIN_BASE =
  "rounded-full px-2.5 py-1.5 text-[13px] leading-none font-semibold whitespace-nowrap tabular-nums shadow-[0_2px_8px_rgba(0,0,0,0.18)] transition-[transform,background-color,color] duration-200 ease-app cursor-pointer";
const PIN_NORMAL = PIN_BASE + " bg-blanco text-negro hover:scale-[1.06]";
const PIN_ACTIVO = PIN_BASE + " bg-negro text-blanco scale-[1.08]";

function pintarPin(marca: maplibregl.Marker, el: HTMLButtonElement, on: boolean) {
  el.className = on ? PIN_ACTIVO : PIN_NORMAL;
  el.setAttribute("aria-pressed", String(on));
  marca.getElement().style.zIndex = on ? "2" : "";
}

export function MapaPreciosLibre({
  pines,
  activo,
  onElegir,
  onVisibles,
}: {
  pines: PinPrecio[];
  activo: string | null;
  onElegir: (id: string | null) => void;
  onVisibles: (ids: string[]) => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<maplibregl.Map | null>(null);
  const marcas = useRef(new Map<string, { marca: maplibregl.Marker; el: HTMLButtonElement }>());
  const cbs = useRef({ onElegir, onVisibles });
  useEffect(() => {
    cbs.current = { onElegir, onVisibles };
  });

  // Mapa (una vez)
  useEffect(() => {
    if (!caja.current) return;
    const m = crearMapa(caja.current, CENTRO_PARTIDO, 12, false);
    m.on("click", () => cbs.current.onElegir(null));
    mapa.current = m;
    const actuales = marcas.current;
    return () => {
      actuales.clear();
      m.remove();
      mapa.current = null;
    };
  }, []);

  // Pines + encuadre cuando cambian los resultados
  useEffect(() => {
    const m = mapa.current;
    if (!m) return;
    for (const { marca } of marcas.current.values()) marca.remove();
    marcas.current.clear();

    for (const p of pines) {
      // MapLibre le pone sus clases al contenedor: el estilo va en el boton de adentro
      const contenedor = document.createElement("div");
      const el = document.createElement("button");
      el.type = "button";
      el.className = PIN_NORMAL;
      el.textContent = p.etiqueta;
      el.setAttribute("aria-label", "Ver propiedad, " + p.etiqueta);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        cbs.current.onElegir(p.id);
        // Que el pin quede a la vista, arriba de la tarjeta que aparece abajo
        m.easeTo({ center: [p.lng, p.lat], offset: [0, -Math.round(m.getContainer().clientHeight * 0.12)], duration: 400 });
      });
      contenedor.appendChild(el);
      const marca = new maplibregl.Marker({ element: contenedor, anchor: "center" }).setLngLat([p.lng, p.lat]).addTo(m);
      marcas.current.set(p.id, { marca, el });
    }

    const avisar = () => {
      const b = m.getBounds();
      cbs.current.onVisibles(pines.filter((p) => b.contains([p.lng, p.lat])).map((p) => p.id));
    };
    if (pines.length > 0) {
      const limites = new maplibregl.LngLatBounds();
      for (const p of pines) limites.extend([p.lng, p.lat]);
      m.fitBounds(limites, { padding: 70, maxZoom: 15, duration: 0 });
    }
    avisar();
    m.on("moveend", avisar);
    return () => {
      m.off("moveend", avisar);
    };
  }, [pines]);

  // Pin elegido: negro y arriba de los demas
  useEffect(() => {
    for (const [id, { marca, el }] of marcas.current) pintarPin(marca, el, id === activo);
  }, [activo, pines]);

  return <div ref={caja} className="h-full w-full" />;
}
