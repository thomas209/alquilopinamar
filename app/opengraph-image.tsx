import { imagenOg, TAMANO_OG } from "@/lib/og";
import { SITE_NOMBRE } from "@/lib/seo";

// Imagen generica para compartir el sitio (home, listados y paginas sin foto propia).
export const alt = SITE_NOMBRE + " — Alquiler temporario, anual y venta en Pinamar y alrededores";
export const size = TAMANO_OG;
export const contentType = "image/png";

export default function Image() {
  return imagenOg({ titulo: "Tu casa en la costa.", pie: "Alquilar · Anual · Comprar" });
}
