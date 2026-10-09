"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PATH_CORAZON } from "@/components/site/Corazon";
import { cn } from "@/lib/cn";
import { useFavoritos, useMontado } from "@/store/favoritos";

// Corazon del header con la cantidad de guardadas. Lleva a /favoritos.
export default function BotonFavoritos() {
  const montado = useMontado();
  const cantidad = useFavoritos((s) => s.slugs.length);
  const pulsos = useFavoritos((s) => s.pulsos);
  const [late, setLate] = useState(false);
  const previo = useRef(pulsos);

  useEffect(() => {
    if (pulsos === previo.current) return;
    previo.current = pulsos;
    setLate(true);
    const t = setTimeout(() => setLate(false), 600);
    return () => clearTimeout(t);
  }, [pulsos]);

  const n = montado ? cantidad : 0;
  return (
    <Link
      href="/favoritos"
      prefetch
      aria-label={n > 0 ? "Favoritos, " + n + (n === 1 ? " guardada" : " guardadas") : "Favoritos"}
      className="relative grid size-10 place-items-center rounded-full transition-[opacity,transform] duration-200 ease-app hover:opacity-70 active:scale-[0.97]"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={cn("size-[22px]", late && "animate-pop")} fill={n > 0 ? "#DC2626" : "none"} stroke={n > 0 ? "#DC2626" : "currentColor"} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d={PATH_CORAZON} />
      </svg>
      {n > 0 && (
        <span className="absolute top-0.5 right-0 grid h-[18px] min-w-[18px] place-items-center rounded-pastilla bg-negro px-1 text-[11px] leading-none font-semibold text-blanco tabular-nums">
          {n}
        </span>
      )}
    </Link>
  );
}
