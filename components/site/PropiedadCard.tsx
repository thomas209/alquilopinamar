import Link from "next/link";
import Foto from "@/components/site/Foto";
import Precio from "@/components/ui/Precio";
import Rotulo from "@/components/ui/Rotulo";
import { etiquetaDe, TIPOS } from "@/lib/etiquetas";
import { datosClave } from "@/lib/busqueda";
import { cn } from "@/lib/cn";
import type { CardPropiedad } from "@/lib/sitio";

const SIZES = "(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 33vw";

// Card de propiedad. En el celular la foto va de borde a borde ("aBorde").
export default function PropiedadCard({ p, aBorde = false, prioridad = false, className }: { p: CardPropiedad; aBorde?: boolean; prioridad?: boolean; className?: string }) {
  const datos = datosClave(p);
  return (
    <Link href={"/propiedad/" + p.slug} prefetch className={cn("group block transition-transform duration-200 ease-app active:scale-[0.99]", className)}>
      <div className={cn("relative overflow-hidden bg-gris-100", aBorde ? "md:rounded-card" : "rounded-card")}>
        {/* Carrusel nativo: se desliza con el dedo, sin botones */}
        <div className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {p.fotos.map((url, i) => (
            <Foto
              key={url}
              url={url}
              alt={i === 0 ? p.title : p.title + " — foto " + (i + 1)}
              sizes={SIZES}
              recorte="4:3"
              anchos={[480, 800, 1200]}
              prioridad={prioridad && i === 0}
              className="h-full w-full shrink-0 snap-center object-cover transition-transform duration-[450ms] ease-app md:group-hover:scale-[1.03]"
            />
          ))}
        </div>
        {p.isFeatured && (
          <span className="vidrio-circulo absolute top-3 left-3 rounded-pastilla px-2.5 py-1.5 font-rotulo text-[10px] leading-none tracking-[0.08em] uppercase">Destacada</span>
        )}
        {p.fotos.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-pastilla bg-negro/55 px-2 py-1 font-rotulo text-[10px] leading-none tracking-[0.06em] text-blanco">
            1 / {p.fotos.length}
          </span>
        )}
      </div>
      <div className={cn("pt-3 pb-1", aBorde && "px-4 md:px-0")}>
        <Rotulo como="p">
          {p.zona} · {etiquetaDe(TIPOS, p.type)}
        </Rotulo>
        <h3 className="mt-2 line-clamp-1 font-titulo text-[17px] leading-snug font-medium tracking-[-0.02em]">{p.title}</h3>
        {datos && <p className="mt-0.5 text-[14px] text-texto-2">{datos}</p>}
        <Precio monto={p.price} moneda={p.currency} periodo={p.pricePeriod} className="mt-2" />
      </div>
    </Link>
  );
}
