"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Texto largo que arranca cortado en unas lineas, con "Leer más" para abrirlo.
// El boton solo aparece si el texto realmente no entra.
export default function TextoPlegable({ texto, lineas = 6, className }: { texto: string; lineas?: number; className?: string }) {
  const parrafo = useRef<HTMLParagraphElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [corta, setCorta] = useState(false);

  useLayoutEffect(() => {
    const el = parrafo.current;
    if (el && !abierto) setCorta(el.scrollHeight > el.clientHeight + 2);
  }, [texto, abierto]);

  return (
    <div>
      <p
        ref={parrafo}
        style={abierto ? undefined : { WebkitLineClamp: lineas, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}
        className={cn("whitespace-pre-line", className)}
      >
        {texto}
      </p>
      {(corta || abierto) && (
        <button type="button" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="mt-3 text-[15px] font-medium underline underline-offset-4 transition-opacity hover:opacity-70">
          {abierto ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
}
