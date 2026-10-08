// /llms.txt: resumen del sitio en Markdown para asistentes de IA (llmstxt.org).
import { etiquetaDe, OPERACIONES, TIPOS } from "@/lib/etiquetas";
import { OPERACIONES_URL } from "@/lib/busqueda";
import { formatearCodigo } from "@/lib/formato";
import { recortar, SITE_DESCRIPCION, SITE_NOMBRE, SITE_URL } from "@/lib/seo";
import { paraSitemap } from "@/lib/sitio";

export const dynamic = "force-dynamic";

const MAX_PROPIEDADES = 200;

export async function GET() {
  const { propiedades, zonas } = await paraSitemap();
  const lineas = [
    "# " + SITE_NOMBRE,
    "",
    "> " + SITE_DESCRIPCION,
    "",
    "Marketplace inmobiliario del Partido de Pinamar (provincia de Buenos Aires, Argentina). Cada propiedad tiene un código (AP-0000), fotos, precio en dólares o pesos (sin conversión) y un formulario o WhatsApp para consultar. La dirección exacta no se publica.",
    "",
    "## Buscar",
    "",
    "- [Todas las propiedades](" + SITE_URL + "/propiedades)",
    ...OPERACIONES_URL.map((o) => "- [" + o.titulo + "](" + SITE_URL + "/propiedades?operacion=" + o.url + ")"),
    "",
    "## Zonas",
    "",
    ...zonas.map((z) => "- [" + z.name + "](" + SITE_URL + "/zonas/" + z.slug + ")" + (z.description ? ": " + recortar(z.description, 140) : "")),
    "",
    "## Propiedades publicadas",
    "",
    ...(propiedades.length === 0
      ? ["Todavía no hay propiedades publicadas."]
      : propiedades
          .slice(0, MAX_PROPIEDADES)
          .map((p) => "- [" + formatearCodigo(p.code) + " · " + p.title + "](" + SITE_URL + "/propiedad/" + p.slug + "): " + etiquetaDe(TIPOS, p.type) + ", " + etiquetaDe(OPERACIONES, p.operation).toLowerCase() + " en " + p.zone.name)),
    "",
  ];
  return new Response(lineas.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
