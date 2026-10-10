"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Corazon from "@/components/site/Corazon";
import Foto from "@/components/site/Foto";
import PropiedadCard from "@/components/site/PropiedadCard";
import Icono from "@/components/ui/Icono";
import Precio from "@/components/ui/Precio";
import Rotulo from "@/components/ui/Rotulo";
import { MapaPrecios, type PinPrecio } from "@/components/mapa";
import { datosClave } from "@/lib/busqueda";
import { etiquetaDe, TIPOS } from "@/lib/etiquetas";
import { precioCorto } from "@/lib/formato";
import type { PuntoMapa } from "@/lib/sitio";

// Vista mapa del listado. Celular: mapa de borde a borde y la propiedad elegida abajo.
// Desktop: a la izquierda las que se ven en el mapa (cambian al moverlo), a la derecha el mapa.
export default function VistaMapa({ puntos, sinUbicacion }: { puntos: PuntoMapa[]; sinUbicacion: number }) {
  const [activo, setActivo] = useState<string | null>(null);
  const [visibles, setVisibles] = useState<string[] | null>(null);

  const pines = useMemo<PinPrecio[]>(
    () => puntos.map((p) => ({ id: p.card.id, lat: p.lat, lng: p.lng, etiqueta: precioCorto(p.card.price, p.card.currency) })),
    [puntos],
  );
  const elegido = puntos.find((p) => p.card.id === activo)?.card ?? null;
  const enVista = visibles === null ? puntos : puntos.filter((p) => visibles.includes(p.card.id));

  return (
    <div className="mt-5 md:mx-auto md:grid md:max-w-[1440px] md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-6 md:px-12">
      {/* Lista (solo desktop): lo que se ve en el mapa */}
      <div className="hidden md:block">
        <p className="text-[14px] text-texto-2" aria-live="polite">
          {puntos.length === 0
            ? ""
            : enVista.length === 0
              ? "Ninguna en esta parte del mapa. Alejá o mové el mapa."
              : enVista.length === 1
                ? "1 en el mapa"
                : enVista.length + " en el mapa"}
          {sinUbicacion > 0 && (puntos.length > 0 ? " · " : "") + sinUbicacion + (sinUbicacion === 1 ? " sin ubicación cargada: no aparece en el mapa." : " sin ubicación cargada: no aparecen en el mapa.")}
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-x-5 gap-y-8 xl:grid-cols-2">
          {enVista.map((p) => (
            <li key={p.card.id} onMouseEnter={() => setActivo(p.card.id)} onMouseLeave={() => setActivo((a) => (a === p.card.id ? null : a))}>
              <PropiedadCard p={p.card} />
            </li>
          ))}
        </ul>
      </div>

      {/* Mapa */}
      <div className="relative isolate h-[calc(100svh-150px)] min-h-[420px] overflow-hidden bg-gris-100 md:sticky md:top-20 md:h-[calc(100svh-104px)] md:rounded-card">
        <MapaPrecios pines={pines} activo={activo} onElegir={setActivo} onVisibles={setVisibles} />

        {puntos.length === 0 && (
          <div className="pointer-events-none absolute top-3 right-3 left-14 z-[3] rounded-card bg-blanco/90 px-4 py-3 text-[14px] text-texto-2 backdrop-blur-md">
            {sinUbicacion > 0 ? "Estas propiedades todavía no tienen la ubicación cargada. Miralas en la lista." : "No hay propiedades con esos filtros."}
          </div>
        )}

        {elegido && <TarjetaMapa p={elegido} onCerrar={() => setActivo(null)} />}
      </div>
    </div>
  );
}

// Propiedad elegida en el mapa: tarjeta horizontal de vidrio abajo.
function TarjetaMapa({ p, onCerrar }: { p: PuntoMapa["card"]; onCerrar: () => void }) {
  const datos = datosClave(p);
  return (
    <div className="absolute inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[3] mx-auto max-w-[460px] animate-hoja-sube md:bottom-4">
      <Link href={"/propiedad/" + p.slug} className="vidrio-hoja flex overflow-hidden rounded-card shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-transform duration-200 ease-app active:scale-[0.98]">
        <div className="relative w-[132px] shrink-0 bg-gris-100">
          {p.fotos[0] && <Foto url={p.fotos[0]} alt={p.title} sizes="132px" recorte="4:3" anchos={[264, 400]} className="absolute inset-0 h-full w-full object-cover" />}
          <Corazon slug={p.slug} titulo={p.title} className="top-2 right-2 size-8" />
        </div>
        <div className="min-w-0 flex-1 py-3 pr-10 pl-3.5">
          <Rotulo como="p" className="truncate">
            {p.zona} · {etiquetaDe(TIPOS, p.type)}
          </Rotulo>
          <p className="mt-1.5 line-clamp-1 font-titulo text-[16px] font-medium tracking-[-0.02em]">{p.title}</p>
          {datos && <p className="mt-0.5 line-clamp-1 text-[13px] text-texto-2">{datos}</p>}
          <Precio monto={p.price} moneda={p.currency} periodo={p.pricePeriod} className="mt-1.5" />
        </div>
      </Link>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-texto-2 transition-colors hover:bg-gris-100 hover:text-negro"
      >
        <Icono nombre="cerrar" tamano={16} />
      </button>
    </div>
  );
}
