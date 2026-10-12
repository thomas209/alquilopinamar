"use client";
import { create } from "zustand";

// Fechas y huespedes elegidos en la ficha. Los comparten el calendario,
// la tarjeta de reserva de la derecha, la barra del celular y la consulta.
// Son de una sola propiedad: si cambia el slug, se ignoran.
type Fechas = {
  slug: string | null;
  desde: string | null;
  hasta: string | null;
  huespedes: number | null;
  ponerFechas: (slug: string, desde: string | null, hasta: string | null) => void;
  ponerHuespedes: (slug: string, n: number | null) => void;
};

export const useFechas = create<Fechas>()((set, get) => ({
  slug: null,
  desde: null,
  hasta: null,
  huespedes: null,
  ponerFechas: (slug, desde, hasta) => set({ slug, desde, hasta, huespedes: get().slug === slug ? get().huespedes : null }),
  ponerHuespedes: (slug, huespedes) => set(get().slug === slug ? { huespedes } : { slug, desde: null, hasta: null, huespedes }),
}));

// Lo elegido para esta propiedad (o vacio)
export function useFechasDe(slug: string) {
  const s = useFechas();
  const propia = s.slug === slug;
  return {
    desde: propia ? s.desde : null,
    hasta: propia ? s.hasta : null,
    huespedes: propia ? s.huespedes : null,
    ponerFechas: (desde: string | null, hasta: string | null) => s.ponerFechas(slug, desde, hasta),
    ponerHuespedes: (n: number | null) => s.ponerHuespedes(slug, n),
  };
}
