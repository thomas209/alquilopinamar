"use client";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type OpcionSegmentado<T extends string> = { valor: T; etiqueta: string };

// Selector segmentado: una pastilla negra se desliza hasta la opcion elegida.
// Se usa para la operacion (Alquilar / Anual / Comprar) y el tipo de propiedad.
// Si las opciones no entran en el ancho, se desliza de costado.
export default function Segmentado<T extends string>({
  opciones,
  valor,
  onChange,
  etiqueta,
  ancho = false,
  className,
}: {
  opciones: OpcionSegmentado<T>[];
  valor: T;
  onChange: (valor: T) => void;
  etiqueta: string; // nombre del grupo para lectores de pantalla
  ancho?: boolean; // reparte las opciones en todo el ancho
  className?: string;
}) {
  const botones = useRef<Record<string, HTMLButtonElement | null>>({});
  const pastilla = useRef<HTMLSpanElement>(null);
  const ubicada = useRef(false);

  // La pastilla se mueve tocando su estilo directo: no hace falta volver a dibujar el componente.
  useLayoutEffect(() => {
    const mover = () => {
      const boton = botones.current[valor];
      const p = pastilla.current;
      if (!boton || !p) return;
      p.style.width = boton.offsetWidth + "px";
      p.style.transform = "translateX(" + boton.offsetLeft + "px)";
      p.style.opacity = "1";
    };
    mover();
    // La primera vez aparece quieta en su lugar; la animacion se activa despues.
    let frame = 0;
    if (!ubicada.current) {
      frame = requestAnimationFrame(() => {
        ubicada.current = true;
        if (pastilla.current) {
          pastilla.current.style.transition = "transform 0.3s var(--ease-app), width 0.3s var(--ease-app)";
        }
      });
    }
    window.addEventListener("resize", mover);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", mover);
    };
  }, [valor, opciones]);

  return (
    <div
      role="radiogroup"
      aria-label={etiqueta}
      className={cn(
        "relative max-w-full overflow-x-auto rounded-pastilla bg-negro/[0.06] p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        ancho ? "flex w-full" : "inline-flex",
        className,
      )}
    >
      <span
        ref={pastilla}
        aria-hidden="true"
        className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-pastilla bg-negro opacity-0"
      />
      {opciones.map((o) => {
        const activa = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              botones.current[o.valor] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            onClick={() => onChange(o.valor)}
            className={cn(
              "relative z-[1] h-11 shrink-0 rounded-pastilla px-[18px] text-[14px] font-medium whitespace-nowrap transition-colors duration-300",
              ancho && "flex-1",
              activa ? "text-blanco" : "text-negro",
            )}
          >
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}
