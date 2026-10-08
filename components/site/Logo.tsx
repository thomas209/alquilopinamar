import Image from "next/image";
import { PROPORCION, urlMarca, type PiezaMarca } from "@/lib/marca";
import { cn } from "@/lib/cn";

// Logo servido desde Cloudinary al alto pedido (x3 para pantallas retina).
// El ancho sale de la proporcion de cada pieza: la pagina no "salta" al cargar.
export default function Logo({
  pieza = "logo-horizontal",
  alto,
  prioridad = false,
  className,
}: {
  pieza?: PiezaMarca;
  alto: number; // en px de pantalla
  prioridad?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={urlMarca(pieza, alto * 3)}
      alt="AlquiloPinamar"
      width={Math.round(alto * PROPORCION[pieza])}
      height={alto}
      unoptimized // Cloudinary ya entrega el tamaño y formato justos
      priority={prioridad}
      className={cn("block h-auto max-w-none select-none", className)}
      style={{ height: alto, width: "auto" }}
    />
  );
}
