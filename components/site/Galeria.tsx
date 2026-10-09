"use client";
import { useEffect, useRef, useState } from "react";
import Corazon from "@/components/site/Corazon";
import Foto from "@/components/site/Foto";
import Icono from "@/components/ui/Icono";

type FotoGaleria = { id: string; url: string };

// Galeria de la ficha. Celular: carrusel de borde a borde con contador.
// Desktop: mosaico de 1 grande + 4. Al tocar una foto se abre el visor a pantalla completa.
export default function Galeria({ fotos, titulo, slug }: { fotos: FotoGaleria[]; titulo: string; slug: string }) {
  const carrusel = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);
  const [visor, setVisor] = useState<number | null>(null);
  const alt = (i: number) => (i === 0 ? titulo : titulo + " — foto " + (i + 1));

  // Con el visor abierto: Escape cierra y la pagina de atras no se mueve.
  useEffect(() => {
    if (visor === null) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && setVisor(null);
    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    document.getElementById("visor-foto-" + visor)?.scrollIntoView({ block: "start" });
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
    };
  }, [visor]);

  if (fotos.length === 0) return <div className="aspect-[4/3] bg-gris-100 md:rounded-card" />;
  const mosaico = fotos.slice(0, 5);

  return (
    <>
      {/* Celular */}
      <div className="relative md:hidden">
        <div
          ref={carrusel}
          onScroll={(e) => setActual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto bg-gris-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((f, i) => (
            <button key={f.id} type="button" aria-label={"Ver foto " + (i + 1) + " en grande"} onClick={() => setVisor(i)} className="h-full w-full shrink-0 snap-center">
              <Foto url={f.url} alt={alt(i)} sizes="100vw" recorte="4:3" prioridad={i === 0} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <Corazon slug={slug} titulo={titulo} />
        <span className="pointer-events-none absolute right-3 bottom-3 rounded-pastilla bg-negro/55 px-2.5 py-1.5 font-rotulo text-[11px] leading-none tracking-[0.06em] text-blanco">
          {actual + 1} / {fotos.length}
        </span>
      </div>

      {/* Desktop */}
      <div className="relative hidden h-[min(62vh,620px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-card md:grid">
        {mosaico.map((f, i) => (
          <button
            key={f.id}
            type="button"
            aria-label={"Ver foto " + (i + 1) + " en grande"}
            onClick={() => setVisor(i)}
            className={"group overflow-hidden bg-gris-100 " + (i === 0 ? (mosaico.length === 1 ? "col-span-4 row-span-2" : "col-span-2 row-span-2") : mosaico.length < 5 && i === mosaico.length - 1 && mosaico.length % 2 === 0 ? "col-span-2 row-span-2" : "")}
          >
            <Foto
              url={f.url}
              alt={alt(i)}
              sizes={i === 0 ? "(max-width: 1440px) 50vw, 720px" : "(max-width: 1440px) 25vw, 360px"}
              recorte={i === 0 ? "4:3" : "3:2"}
              prioridad={i === 0}
              className="h-full w-full object-cover transition-transform duration-[450ms] ease-app group-hover:scale-[1.03]"
            />
          </button>
        ))}
        <Corazon slug={slug} titulo={titulo} grande />
        <button type="button" onClick={() => setVisor(0)} className="vidrio-circulo absolute right-4 bottom-4 h-10 rounded-pastilla px-4 text-[13px] font-medium active:scale-[0.97]">
          Ver las {fotos.length} fotos
        </button>
      </div>

      {/* Visor a pantalla completa: fotos enteras, una debajo de la otra */}
      {visor !== null && (
        <div role="dialog" aria-modal="true" aria-label={"Fotos de " + titulo} className="fixed inset-0 z-50 animate-velo overflow-y-auto bg-blanco">
          <div className="vidrio-header sticky top-0 z-[1] flex h-14 items-center justify-between px-4 md:px-12">
            <span className="font-rotulo text-[11px] tracking-[0.1em] text-texto-2 uppercase">{fotos.length} fotos</span>
            <button type="button" aria-label="Cerrar" onClick={() => setVisor(null)} autoFocus className="flex size-10 items-center justify-center rounded-full bg-gris-100 active:scale-[0.97]">
              <Icono nombre="cerrar" tamano={20} />
            </button>
          </div>
          <div className="mx-auto max-w-[1100px] space-y-2 pb-10 md:space-y-4 md:px-12">
            {fotos.map((f, i) => (
              <div key={f.id} id={"visor-foto-" + i} className="scroll-mt-14">
                <Foto url={f.url} alt={alt(i)} sizes="(max-width: 1100px) 100vw, 1100px" anchos={[800, 1200, 1600, 2400]} className="w-full md:rounded-card" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
