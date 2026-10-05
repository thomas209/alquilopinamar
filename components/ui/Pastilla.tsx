import { cn } from "@/lib/cn";

// Pastilla seleccionable (filtros, amenities). Activa = negra con texto blanco.
export function PastillaFiltro({
  activa = false,
  className,
  children,
  ...props
}: { activa?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-pastilla px-[18px] text-[14px] font-medium whitespace-nowrap",
        "transition-[transform,background-color,color] duration-200 ease-app active:scale-[0.97]",
        activa ? "bg-negro text-blanco" : "bg-gris-100 text-negro hover:bg-gris-200",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type Tono = "ok" | "error" | "neutro" | "negro";

const TONOS: Record<Tono, string> = {
  ok: "bg-ok/10 text-ok",
  error: "bg-error/10 text-error",
  neutro: "bg-gris-100 text-texto-2",
  negro: "bg-negro text-blanco",
};

// Etiqueta de estado (Publicada, En revision, Rechazada, Destacada...). No es clickeable.
export function PastillaEstado({
  tono = "neutro",
  punto = false,
  className,
  children,
}: {
  tono?: Tono;
  punto?: boolean; // puntito adelante (ej: "Disponible")
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[7px] rounded-pastilla px-[10px] py-[6px] font-rotulo text-[10px] leading-none tracking-[0.08em] uppercase",
        TONOS[tono],
        className,
      )}
    >
      {punto && <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

// Numerito en circulo negro (filtros activos, favoritos).
export function Contador({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid h-5 min-w-5 place-items-center rounded-pastilla bg-negro px-1.5 text-[11px] leading-none font-semibold text-blanco",
        className,
      )}
    >
      {children}
    </span>
  );
}
