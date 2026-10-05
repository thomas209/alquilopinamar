import { cn } from "@/lib/cn";

// Bloque suave sobre gris (resumenes, datos del anfitrion). Sin sombra.
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[22px] bg-gris-50 p-5 md:p-6", className)}>{children}</div>;
}

// Marco de una foto: proporcion fija, esquinas redondeadas y fondo gris mientras carga.
// Lo que se ponga adentro en "absolute" (corazon, etiquetas) queda sobre la foto.
export function CardFoto({
  proporcion = "4/3",
  className,
  children,
}: {
  proporcion?: "4/3" | "3/2" | "1/1";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-card bg-gris-100",
        proporcion === "4/3" && "aspect-[4/3]",
        proporcion === "3/2" && "aspect-[3/2]",
        proporcion === "1/1" && "aspect-square",
        className,
      )}
    >
      {children}
    </div>
  );
}
