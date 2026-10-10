"use client";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useFavoritos, useMontado } from "@/store/favoritos";

export const PATH_CORAZON =
  "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";

// Corazon de favoritos sobre la foto, en circulo de vidrio.
// Va dentro de un contenedor con position: relative.
export default function Corazon({ slug, titulo, grande = false, className }: { slug: string; titulo: string; grande?: boolean; className?: string }) {
  const montado = useMontado();
  const guardada = useFavoritos((s) => s.slugs.includes(slug));
  const alternar = useFavoritos((s) => s.alternar);
  const [pop, setPop] = useState(0);
  const on = montado && guardada;

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Quitar " + titulo + " de favoritos" : "Guardar " + titulo + " en favoritos"}
      onClick={(e) => {
        // Esta adentro del link de la card: que no navegue
        e.preventDefault();
        e.stopPropagation();
        if (alternar(slug)) setPop((n) => n + 1);
      }}
      className={cn(
        "vidrio-sobre-foto absolute z-[2] grid place-items-center rounded-full transition-transform duration-200 ease-app active:scale-90",
        grande ? "top-4 right-4 size-11" : "top-3 right-3 size-[38px]",
        className,
      )}
    >
      <svg
        key={pop}
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={cn(grande ? "size-5" : "size-[18px]", pop > 0 && on && "animate-pop")}
        fill={on ? "#DC2626" : "none"}
        stroke={on ? "#DC2626" : "#0A0A0A"}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: "fill .2s, stroke .2s" }}
      >
        <path d={PATH_CORAZON} />
      </svg>
    </button>
  );
}
