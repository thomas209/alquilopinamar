import { imagenOg, TAMANO_OG } from "@/lib/og";
import { fotoUrl } from "@/lib/foto";
import { listarPropiedades, zonaPorSlug } from "@/lib/sitio";

export const size = TAMANO_OG;
export const contentType = "image/png";
export const alt = "Propiedades en la zona";

// Foto de la zona (o de su primera propiedad) con el nombre encima.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const z = await zonaPorSlug(slug);
  if (!z) return imagenOg({ titulo: "Pinamar y alrededores", pie: "Alquilar · Anual · Comprar" });

  const { propiedades, total } = await listarPropiedades({ zona: z.slug, limite: 1 });
  const portada = z.coverImage || propiedades[0]?.fotos[0];
  const pie = total === 0 ? "Alquiler y venta de propiedades" : total === 1 ? "1 propiedad publicada" : total + " propiedades publicadas";
  return imagenOg({
    rotulo: "Zona · Partido de Pinamar",
    titulo: z.name,
    pie,
    foto: portada ? fotoUrl(portada, "c_fill,g_auto,w_1200,h_630,q_auto,f_jpg") : null,
  });
}
