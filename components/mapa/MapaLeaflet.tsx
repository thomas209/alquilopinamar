"use client";
// Implementacion con Leaflet. No importar directo: usar components/mapa/index.tsx
// (lo carga solo en el navegador, Leaflet no funciona en el servidor).
import { useEffect } from "react";
import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ATRIBUCION, RADIO_APROXIMADO, TILES } from "@/lib/mapa-datos";

// Pin propio: punto negro con borde blanco (sin las imagenes de Leaflet)
const PIN = L.divIcon({
  className: "",
  html: '<span style="display:block;width:22px;height:22px;border-radius:999px;background:#0A0A0A;border:4px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.28)"></span>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

export type Punto = { lat: number; lng: number };

function Capa() {
  return <TileLayer url={TILES} attribution={ATRIBUCION} subdomains="abcd" maxZoom={19} detectRetina />;
}

function Seguir({ centro, zoom }: { centro: [number, number]; zoom: number }) {
  const mapa = useMap();
  useEffect(() => {
    mapa.flyTo(centro, zoom, { duration: 0.6 });
  }, [mapa, centro, zoom]);
  return null;
}

function AlTocar({ onTocar }: { onTocar: (p: Punto) => void }) {
  useMapEvents({ click: (e) => onTocar({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

// Admin: tocar el mapa (o arrastrar el pin) para marcar la propiedad.
export function MapaElegirLeaflet({ valor, centro, onChange }: { valor: Punto | null; centro: [number, number]; onChange: (p: Punto) => void }) {
  const inicio: [number, number] = valor ? [valor.lat, valor.lng] : centro;
  return (
    <MapContainer center={inicio} zoom={valor ? 16 : 14} scrollWheelZoom className="h-full w-full">
      <Capa />
      {!valor && <Seguir centro={centro} zoom={14} />}
      <AlTocar onTocar={onChange} />
      {valor && (
        <Marker
          position={[valor.lat, valor.lng]}
          icon={PIN}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as L.Marker).getLatLng();
              onChange({ lat: p.lat, lng: p.lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}

// Ficha: punto exacto o circulo de zona aproximada. Sin zoom con la rueda
// (que la pagina se pueda scrollear por arriba del mapa).
export function MapaVerLeaflet({ lat, lng, exacta }: { lat: number; lng: number; exacta: boolean }) {
  return (
    <MapContainer center={[lat, lng]} zoom={exacta ? 16 : 15} scrollWheelZoom={false} className="h-full w-full">
      <Capa />
      {exacta ? (
        <Marker position={[lat, lng]} icon={PIN} keyboard={false} />
      ) : (
        <Circle center={[lat, lng]} radius={RADIO_APROXIMADO} pathOptions={{ color: "#0A0A0A", weight: 1.5, opacity: 0.55, fillColor: "#0A0A0A", fillOpacity: 0.08 }} />
      )}
    </MapContainer>
  );
}
