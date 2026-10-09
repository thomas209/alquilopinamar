"use client";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_FAVORITOS } from "@/lib/favoritos";
import type { CardPropiedad } from "@/lib/sitio";

// Favoritos del visitante, guardados en el navegador (localStorage).
type Favoritos = {
  slugs: string[]; // en el orden en que se guardaron (lo ultimo al final)
  nombre: string; // con el que se comparte la lista
  cache: CardPropiedad[]; // ultimas cards vistas en /favoritos, para mostrarlas al instante
  pulsos: number; // sube con cada guardado (anima el corazon del header)
  alternar: (slug: string) => boolean; // devuelve si quedo guardada
  quitar: (slug: string) => void;
  setNombre: (nombre: string) => void;
  setCache: (cache: CardPropiedad[]) => void;
};

// Si el navegador no deja guardar (modo privado, bloqueado), funciona igual en memoria.
const almacen = createJSONStorage(() => {
  try {
    const prueba = "__ap";
    localStorage.setItem(prueba, "1");
    localStorage.removeItem(prueba);
    return localStorage;
  } catch {
    const memoria = new Map<string, string>();
    return {
      getItem: (k: string) => memoria.get(k) ?? null,
      setItem: (k: string, v: string) => void memoria.set(k, v),
      removeItem: (k: string) => void memoria.delete(k),
    };
  }
});

export const useFavoritos = create<Favoritos>()(
  persist(
    (set, get) => ({
      slugs: [],
      nombre: "",
      cache: [],
      pulsos: 0,
      alternar: (slug) => {
        const { slugs, pulsos } = get();
        if (slugs.includes(slug)) {
          set({ slugs: slugs.filter((s) => s !== slug) });
          return false;
        }
        // Tope de 40: al pasarlo se cae el mas viejo
        set({ slugs: [...slugs, slug].slice(-MAX_FAVORITOS), pulsos: pulsos + 1 });
        return true;
      },
      quitar: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
      setNombre: (nombre) => set({ nombre: nombre.slice(0, 24) }),
      setCache: (cache) => set({ cache }),
    }),
    {
      name: "ap-favoritos",
      version: 1,
      storage: almacen,
      partialize: (s) => ({ slugs: s.slugs, nombre: s.nombre, cache: s.cache }),
    },
  ),
);

// Lo guardado recien se puede leer en el navegador, ya cargado: en el servidor (y al
// hidratar) vale false, asi el HTML del servidor y el del navegador coinciden.
export function useMontado() {
  return useSyncExternalStore(
    (avisar) => useFavoritos.persist.onFinishHydration(avisar),
    () => useFavoritos.persist.hasHydrated(),
    () => false,
  );
}
