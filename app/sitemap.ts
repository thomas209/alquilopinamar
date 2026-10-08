import type { MetadataRoute } from "next";
import { fotoUrl } from "@/lib/foto";
import { OPERACIONES_URL } from "@/lib/busqueda";
import { SITE_URL } from "@/lib/seo";
import { paraSitemap } from "@/lib/sitio";

// Se arma en cada pedido (con cache de 1 h que se refresca al guardar en el admin).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { propiedades, zonas } = await paraSitemap();
  // Fechas ISO: se comparan bien como texto
  const ultima = propiedades.reduce<string | undefined>((max, p) => (!max || p.updatedAt > max ? p.updatedAt : max), undefined);

  return [
    { url: SITE_URL, lastModified: ultima, changeFrequency: "daily", priority: 1 },
    { url: SITE_URL + "/propiedades", lastModified: ultima, changeFrequency: "daily", priority: 0.9 },
    ...OPERACIONES_URL.map((o) => ({ url: SITE_URL + "/propiedades?operacion=" + o.url, lastModified: ultima, changeFrequency: "daily" as const, priority: 0.8 })),
    ...zonas.map((z) => ({ url: SITE_URL + "/zonas/" + z.slug, lastModified: z.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...["/nosotros", "/contacto"].map((r) => ({ url: SITE_URL + r, changeFrequency: "monthly" as const, priority: 0.4 })),
    ...["/terminos", "/privacidad"].map((r) => ({ url: SITE_URL + r, changeFrequency: "yearly" as const, priority: 0.2 })),
    ...propiedades.map((p) => ({
      url: SITE_URL + "/propiedad/" + p.slug,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map((i) => fotoUrl(i.url, "c_limit,w_1600,q_auto,f_jpg")),
    })),
  ];
}
