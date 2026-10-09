"use client";
import { useEffect, useState } from "react";
import PropiedadCard from "@/components/site/PropiedadCard";
import { PATH_CORAZON } from "@/components/site/Corazon";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import Icono from "@/components/ui/Icono";
import { Campo } from "@/components/ui/Campo";
import { rutaLista, tituloLista } from "@/lib/favoritos";
import type { CardPropiedad } from "@/lib/sitio";
import { useFavoritos, useMontado } from "@/store/favoritos";

// Pagina /favoritos: lo guardado (lo ultimo arriba), las que ya no estan y compartir la lista.
export default function Favoritos() {
  const montado = useMontado();
  const slugs = useFavoritos((s) => s.slugs);
  const nombre = useFavoritos((s) => s.nombre);
  const setNombre = useFavoritos((s) => s.setNombre);
  const quitar = useFavoritos((s) => s.quitar);
  const setCache = useFavoritos((s) => s.setCache);
  const cache = useFavoritos((s) => s.cache);
  // Ultima respuesta del servidor, para la lista de slugs con la que se pidio
  const [resp, setResp] = useState<{ clave: string; cards: CardPropiedad[]; error: boolean } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const clave = slugs.join(",");
  useEffect(() => {
    if (!montado || !clave) return;
    let cancelado = false;
    fetch("/api/favoritos?slugs=" + encodeURIComponent(clave))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { propiedades: CardPropiedad[] }) => {
        if (cancelado) return;
        setResp({ clave, cards: d.propiedades, error: false });
        setCache(d.propiedades);
      })
      .catch(() => !cancelado && setResp({ clave, cards: useFavoritos.getState().cache, error: true }));
    return () => {
      cancelado = true;
    };
  }, [clave, montado, setCache]);

  const alDia = !clave || (resp?.clave === clave && !resp.error);
  // Sin respuesta todavia: lo ultimo que se vio (al instante), o "cargando"
  const cards: CardPropiedad[] | null = !clave ? [] : resp?.clave === clave ? resp.cards : cache.length ? cache : null;

  const porSlug = new Map((cards ?? []).map((c) => [c.slug, c]));
  const visibles = [...slugs].reverse().flatMap((s) => porSlug.get(s) ?? []);
  // Solo se marcan "no disponibles" con la respuesta real de la lista actual
  const noDisponibles = alDia ? slugs.filter((s) => !porSlug.has(s)) : [];

  const link = montado && visibles.length ? window.location.origin + rutaLista(visibles.map((c) => c.slug), nombre) : "";
  const mensaje = tituloLista(nombre.trim()) + " en AlquiloPinamar: " + link;

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ title: tituloLista(nombre.trim()), text: tituloLista(nombre.trim()) + " en AlquiloPinamar", url: link });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // cerro el menu
      }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // portapapeles bloqueado: queda el link visible para copiar a mano
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-8 pb-20 md:px-12 md:pt-12">
      <header className="animate-entrada">
        <Rotulo como="p">Favoritos</Rotulo>
        <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[44px]">Tus guardadas</h1>
        <p className="mt-2 max-w-[52ch] text-[15px] text-texto-2">
          Quedan guardadas en este navegador, sin crear cuenta. Compartí la lista con quien viaja con vos.
        </p>
      </header>

      {!montado || cards === null ? (
        <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <div className="aspect-[4/3] animate-pulse rounded-card bg-gris-100" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded-pastilla bg-gris-100" />
            </li>
          ))}
        </ul>
      ) : visibles.length === 0 && noDisponibles.length === 0 ? (
        <div className="mt-14 flex animate-entrada flex-col items-center gap-4 py-10 text-center">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-8" fill="none" stroke="#A3A3A3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d={PATH_CORAZON} />
          </svg>
          <p className="max-w-[36ch] text-[15px] text-texto-2">Todavía no guardaste ninguna. Tocá el corazón de una propiedad para tenerla a mano.</p>
          <Boton href="/propiedades">Ver propiedades</Boton>
        </div>
      ) : (
        <>
          {visibles.length > 0 && (
            <section className="mt-8 animate-entrada rounded-hoja border border-gris-200 p-5 md:flex md:items-end md:gap-4 md:p-6">
              <Campo
                etiqueta="Tu nombre (opcional)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={24}
                autoComplete="given-name"
                placeholder="Para que sepan de quién es la lista"
                className="flex-1"
              />
              <div className="mt-4 grid grid-cols-[3fr_2fr] gap-2 md:mt-0 md:flex">
                <Boton onClick={compartir} disabled={!link}>
                  <Icono nombre="compartir" tamano={18} />
                  {copiado ? "¡Copiado!" : "Compartir"}
                </Boton>
                <Boton variante="secundario" href={"https://wa.me/?text=" + encodeURIComponent(mensaje)} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </Boton>
              </div>
            </section>
          )}

          <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((c, i) => (
              <li key={c.slug} className="animate-entrada" style={{ animationDelay: Math.min(i, 8) * 60 + "ms" }}>
                <PropiedadCard p={c} prioridad={i < 2} />
              </li>
            ))}
          </ul>

          {noDisponibles.length > 0 && (
            <section className="mt-14 border-t border-gris-200 pt-8">
              <h2 className="font-titulo text-[20px] font-medium tracking-[-0.02em]">Ya no disponibles</h2>
              <p className="mt-1 text-[14px] text-texto-2">Se alquilaron, se vendieron o las pausaron.</p>
              <ul className="mt-4 divide-y divide-gris-200">
                {noDisponibles.map((s) => (
                  <li key={s} className="flex items-center justify-between gap-4 py-3">
                    <span className="truncate font-rotulo text-[11px] tracking-[0.08em] text-texto-2 uppercase">{s.replace(/-/g, " ")}</span>
                    <Boton variante="texto" onClick={() => quitar(s)}>
                      Quitar
                    </Boton>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
