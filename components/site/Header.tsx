"use client";
import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import BotonFavoritos from "@/components/site/BotonFavoritos";
import Logo from "@/components/site/Logo";
import { OPERACIONES_URL } from "@/lib/busqueda";
import { cn } from "@/lib/cn";

// Menu de secciones en pastilla: el indicador negro se desliza a la seccion activa.
function Pastilla({ activa, ancho = false }: { activa: string; ancho?: boolean }) {
  const links = useRef<Record<string, HTMLAnchorElement | null>>({});
  const indicador = useRef<HTMLSpanElement>(null);
  // Al tocar, el indicador se mueve al instante; cuando termina la navegacion manda la URL.
  const [tocada, setTocada] = useState<{ desde: string; valor: string } | null>(null);
  const elegida = tocada && tocada.desde === activa ? tocada.valor : activa;

  useLayoutEffect(() => {
    const el = links.current[elegida];
    const ind = indicador.current;
    if (!ind) return;
    if (!el) {
      ind.style.opacity = "0";
      return;
    }
    ind.style.opacity = "1";
    ind.style.width = el.offsetWidth + "px";
    ind.style.transform = "translateX(" + el.offsetLeft + "px)";
  }, [elegida]);

  return (
    <nav aria-label="Secciones" className={cn("relative rounded-pastilla bg-gris-100 p-1", ancho ? "flex w-full" : "inline-flex")}>
      <span ref={indicador} aria-hidden="true" className="pointer-events-none absolute top-1 bottom-1 left-0 rounded-pastilla bg-negro opacity-0 transition-[transform,width,opacity] duration-[450ms] ease-app" />
      {OPERACIONES_URL.map((o) => (
        <Link
          key={o.url}
          ref={(el) => {
            links.current[o.url] = el;
          }}
          href={"/propiedades?operacion=" + o.url}
          prefetch
          onClick={() => setTocada({ desde: activa, valor: o.url })}
          aria-current={elegida === o.url ? "page" : undefined}
          className={cn(
            "relative z-[1] flex h-10 items-center justify-center rounded-pastilla px-5 text-[14px] font-medium transition-colors duration-[450ms]",
            ancho && "flex-1",
            elegida === o.url ? "text-blanco" : "text-negro",
          )}
        >
          {o.etiqueta}
        </Link>
      ))}
    </nav>
  );
}

function Barra({ activa }: { activa: string }) {
  const [oculta, setOculta] = useState(false);

  // Se esconde al bajar y vuelve al subir.
  useEffect(() => {
    let anterior = window.scrollY;
    const alScrollear = () => {
      const y = window.scrollY;
      if (Math.abs(y - anterior) < 8) return;
      setOculta(y > anterior && y > 120);
      anterior = y;
    };
    window.addEventListener("scroll", alScrollear, { passive: true });
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  return (
    <header className={cn("vidrio-header sticky top-0 z-40 border-b border-negro/5 transition-transform duration-[450ms] ease-app", oculta && "-translate-y-full")}>
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-4 px-4 md:h-16 md:px-12">
        <Link href="/" aria-label="AlquiloPinamar, ir al inicio" className="shrink-0 transition-opacity duration-200 hover:opacity-80">
          <Logo alto={34} prioridad className="md:hidden" />
          <Logo alto={40} prioridad className="hidden md:block" />
        </Link>
        <div className="hidden md:block">
          <Pastilla activa={activa} />
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/propiedades" className="text-[14px] font-medium text-negro hover:opacity-70">
            Ver todas
          </Link>
          <BotonFavoritos />
        </div>
      </div>
      <div className="px-4 pb-2 md:hidden">
        <Pastilla activa={activa} ancho />
      </div>
    </header>
  );
}

function BarraConSeccion() {
  const pathname = usePathname();
  const params = useSearchParams();
  return <Barra activa={pathname === "/propiedades" ? (params.get("operacion") ?? "") : ""} />;
}

// Header fijo translucido de la parte publica.
export default function Header() {
  return (
    <Suspense fallback={<Barra activa="" />}>
      <BarraConSeccion />
    </Suspense>
  );
}
