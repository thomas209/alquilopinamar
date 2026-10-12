"use client";
import { useState } from "react";
import Icono from "@/components/ui/Icono";
import { cn } from "@/lib/cn";
import { linkWhatsapp } from "@/lib/whatsapp";

// Compartir la ficha: en el celular abre el menu del sistema (WhatsApp, etc.);
// en la compu, WhatsApp o copiar el link.
export default function Compartir({ titulo, url, className }: { titulo: string; url: string; className?: string }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    if (typeof navigator !== "undefined" && navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: titulo, text: titulo, url });
      } catch {
        // cancelado
      }
      return;
    }
    setAbierto((x) => !x);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      // sin permiso para copiar
    }
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={compartir}
        aria-expanded={abierto}
        className="inline-flex h-10 items-center gap-2 rounded-pastilla px-3.5 text-[14px] font-medium transition-[background-color,transform] duration-200 ease-app hover:bg-gris-100 active:scale-[0.97]"
      >
        <Icono nombre="compartir" tamano={18} />
        Compartir
      </button>
      {abierto && (
        <div className="vidrio-hoja absolute top-12 right-0 z-30 w-56 animate-entrada rounded-card border border-negro/5 p-1.5 shadow-flotante" onMouseLeave={() => setAbierto(false)}>
          <a
            href={linkWhatsapp("", titulo + " " + url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="flex h-11 items-center gap-3 rounded-campo px-3 text-[14px] hover:bg-gris-100"
          >
            <Icono nombre="chat" tamano={18} /> Mandar por WhatsApp
          </a>
          <button type="button" onClick={copiar} className="flex h-11 w-full items-center gap-3 rounded-campo px-3 text-left text-[14px] hover:bg-gris-100">
            <Icono nombre={copiado ? "check" : "compartir"} tamano={18} /> {copiado ? "Link copiado" : "Copiar link"}
          </button>
        </div>
      )}
    </div>
  );
}
