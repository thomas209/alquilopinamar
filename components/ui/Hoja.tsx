"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import Icono from "@/components/ui/Icono";

const ENFOCABLES = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Hoja de vidrio.
// - "panel": en el celular sube desde abajo; en compu es un panel flotante a la derecha.
// - "centrada": cartel chico para confirmaciones.
// Se cierra con Escape, tocando afuera o con la X. Mientras esta abierta la pagina no se mueve.
export default function Hoja({
  abierta,
  onCerrar,
  titulo,
  variante = "panel",
  pie,
  children,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  variante?: "panel" | "centrada";
  pie?: React.ReactNode; // botones fijos abajo (solo en "panel")
  children: React.ReactNode;
}) {
  const hoja = useRef<HTMLDivElement>(null);
  const cerrar = useRef(onCerrar);
  useEffect(() => {
    cerrar.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!abierta) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    hoja.current?.focus();

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar.current();
        return;
      }
      // El foco no se escapa de la hoja con Tab
      if (e.key !== "Tab" || !hoja.current) return;
      const items = Array.from(hoja.current.querySelectorAll<HTMLElement>(ENFOCABLES));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const primero = items[0];
      const ultimo = items[items.length - 1];
      const actual = document.activeElement;
      if (e.shiftKey && (actual === primero || actual === hoja.current)) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && actual === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);

    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [abierta]);

  if (!abierta) return null;

  const cabecera = (
    <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-3.5">
      <h2 className="font-titulo text-[22px] leading-tight font-semibold tracking-[-0.02em]">{titulo}</h2>
      <button
        type="button"
        onClick={onCerrar}
        aria-label="Cerrar"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-negro/[0.07] text-negro transition-transform duration-200 ease-app active:scale-90"
      >
        <Icono nombre="cerrar" tamano={16} />
      </button>
    </div>
  );

  // El velo va como hermano de la hoja (no como contenedor): si la hoja quedara
  // adentro de un elemento animado, el desenfoque del vidrio dejaria de ver la pagina.
  return createPortal(
    <>
      <div aria-hidden="true" className="velo animate-velo fixed inset-0 z-[100]" onMouseDown={onCerrar} />
      {variante === "panel" ? (
        <div
          ref={hoja}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          tabIndex={-1}
          className={cn(
            "vidrio-hoja animate-hoja-sube fixed inset-x-0 bottom-0 z-[101] flex max-h-[88dvh] flex-col rounded-t-hoja shadow-hoja outline-none",
            "md:animate-hoja-entra md:inset-x-auto md:top-3 md:right-3 md:bottom-3 md:max-h-none md:w-[420px] md:rounded-hoja",
          )}
        >
          {cabecera}
          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-1 pb-5">{children}</div>
          {pie && (
            <div className="flex flex-col gap-3 border-t border-negro/[0.08] px-5 pt-4 pb-[calc(18px+env(safe-area-inset-bottom))] md:pb-5">
              {pie}
            </div>
          )}
        </div>
      ) : (
        <div className="pointer-events-none fixed inset-0 z-[101] grid items-end justify-items-center p-4 pb-[calc(16px+env(safe-area-inset-bottom))] md:items-center">
          <div
            ref={hoja}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            tabIndex={-1}
            className="vidrio-hoja animate-hoja-sube pointer-events-auto w-full max-w-[400px] rounded-[30px] shadow-hoja outline-none"
          >
            {cabecera}
            <div className="px-5 pt-1 pb-5">{children}</div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
}
