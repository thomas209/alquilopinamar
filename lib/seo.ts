// SEO compartido: datos del sitio, metadata completa por pagina y JSON-LD.
//
// Ojo con Next: si una pagina define "openGraph", reemplaza ENTERO al del layout
// (pierde imagen, nombre del sitio e idioma). Por eso toda pagina publica arma su
// metadata con metadataDePagina(), que siempre devuelve el bloque completo.
import type { Metadata } from "next";

export const SITE_URL = (process.env.NEXT_PUBLIC_URL || "http://localhost:3000").replace(/\/$/, "");
export const SITE_NOMBRE = "AlquiloPinamar";
export const SITE_DESCRIPCION =
  "Alquiler temporario, alquiler anual y venta de propiedades en Pinamar, Cariló, Valeria del Mar, Ostende y Costa Esmeralda. Fotos reales, precios claros y consulta directa.";
export const ZONAS_TEXTO = "Pinamar · Cariló · Valeria del Mar · Ostende · Costa Esmeralda";

// Solo produccion se indexa: previews de Vercel y local quedan fuera de Google.
export const SE_INDEXA = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : process.env.NODE_ENV === "production";

export const urlAbsoluta = (ruta: string) => (ruta.startsWith("http") ? ruta : SITE_URL + (ruta.startsWith("/") ? ruta : "/" + ruta));

type Imagen = { url: string; width?: number; height?: number; alt?: string };

export function metadataDePagina({
  titulo,
  tituloAbsoluto = false,
  descripcion,
  ruta,
  imagen,
  noIndexar = false,
}: {
  titulo: string;
  tituloAbsoluto?: boolean; // true = sin el " | AlquiloPinamar" del final
  descripcion: string;
  ruta: string; // canonica, ej "/zonas/carilo"
  // undefined = la imagen generica del sitio; null = la pone un opengraph-image del segmento
  imagen?: Imagen | null;
  noIndexar?: boolean;
}): Metadata {
  const desc = recortar(descripcion, 160);
  const ogTitulo = tituloAbsoluto ? titulo : titulo + " | " + SITE_NOMBRE;
  const imagenes = imagen === null ? undefined : [imagen ?? { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_NOMBRE }];
  return {
    title: tituloAbsoluto ? { absolute: titulo } : titulo,
    description: desc,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      siteName: SITE_NOMBRE,
      locale: "es_AR",
      url: ruta,
      title: ogTitulo,
      description: desc,
      ...(imagenes ? { images: imagenes } : {}),
    },
    twitter: { card: "summary_large_image", title: ogTitulo, description: desc, ...(imagenes ? { images: imagenes.map((i) => i.url) } : {}) },
    ...(noIndexar ? { robots: { index: false, follow: true } } : {}),
  };
}

// Corta en el ultimo espacio antes del limite y agrega "…". Junta espacios y saltos.
export function recortar(texto: string, max: number): string {
  const t = texto.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max - 1);
  return corte.slice(0, Math.max(corte.lastIndexOf(" "), max * 0.6)).replace(/[\s,.;:–-]+$/, "") + "…";
}

// Migas de pan para JSON-LD
export function migasDePan(items: { nombre: string; ruta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: urlAbsoluta(it.ruta) })),
  };
}
