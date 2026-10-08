import { fotoUrl } from "@/lib/foto";

// Foto de Cloudinary servida al tamaño justo de cada pantalla (la original queda intacta).
// "recorte" fija la proporcion (ej: "4:3"); sin recorte se respeta la de la foto.
export default function Foto({
  url,
  alt,
  sizes,
  recorte,
  anchos = [480, 800, 1200, 1600],
  prioridad = false,
  className,
}: {
  url: string;
  alt: string;
  sizes: string;
  recorte?: "4:3" | "3:2" | "1:1" | "16:9";
  anchos?: number[];
  prioridad?: boolean; // la primera foto de la pantalla
  className?: string;
}) {
  const t = (w: number) => fotoUrl(url, (recorte ? "c_fill,g_auto,ar_" + recorte : "c_limit") + ",w_" + w + ",q_auto:best,f_auto");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={t(anchos[Math.min(1, anchos.length - 1)])}
      srcSet={anchos.map((w) => t(w) + " " + w + "w").join(", ")}
      sizes={sizes}
      alt={alt}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={className}
    />
  );
}
