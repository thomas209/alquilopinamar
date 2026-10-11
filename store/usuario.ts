"use client";
import { useEffect } from "react";
import { create } from "zustand";

// Usuario con la sesion iniciada, visto desde el navegador.
// Las paginas publicas estan en cache (iguales para todos), asi que el header y
// el formulario de consulta lo piden aparte a /api/auth/usuario/yo, una vez.
export type Usuario = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  whatsapp: string | null;
  isHost: boolean;
};

type Estado = {
  usuario: Usuario | null | undefined; // undefined = todavia no se sabe
  poner: (u: Usuario | null) => void;
};

export const useSesion = create<Estado>()((set) => ({
  usuario: undefined,
  poner: (usuario) => set({ usuario }),
}));

let pedido: Promise<void> | null = null;

function cargar() {
  pedido ??= fetch("/api/auth/usuario/yo", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .then((d: { user: Usuario | null }) => useSesion.getState().poner(d.user ?? null))
    .catch(() => useSesion.getState().poner(null));
  return pedido;
}

// Devuelve el usuario (o null, o undefined mientras carga) y lo pide la primera vez.
export function useUsuario(): Usuario | null | undefined {
  const usuario = useSesion((s) => s.usuario);
  useEffect(() => {
    void cargar();
  }, []);
  return usuario;
}

// Despues de entrar o salir. Con el usuario nuevo (o null) se pone directo;
// sin nada, se vuelve a preguntar al servidor.
export function renovarSesion(nuevo?: Usuario | null) {
  if (nuevo !== undefined) {
    pedido = Promise.resolve();
    useSesion.getState().poner(nuevo);
    return;
  }
  pedido = null;
  void cargar();
}
