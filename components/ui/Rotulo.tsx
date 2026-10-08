import { cn } from "@/lib/cn";

// Rotulo corto en MAYUSCULAS con DM Mono: zona, tipo, codigo, etiquetas.
export default function Rotulo({
  children,
  tono = "normal",
  como: Como = "span",
  className,
}: {
  children: React.ReactNode;
  tono?: "normal" | "rojo" | "negro" | "claro"; // claro = sobre fondo negro
  como?: "span" | "p" | "div";
  className?: string;
}) {
  return (
    <Como
      className={cn(
        "font-rotulo text-[11px] leading-none tracking-[0.1em] uppercase",
        tono === "normal" && "text-texto-2",
        tono === "rojo" && "text-error",
        tono === "negro" && "text-negro",
        tono === "claro" && "text-blanco/60",
        className,
      )}
    >
      {children}
    </Como>
  );
}
