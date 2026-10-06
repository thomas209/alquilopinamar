import { entero, texto } from "@/lib/api";
import { slugify } from "@/lib/slug";

// Valida y ordena lo que llega del formulario de zona.
export function datosDeZona(body: Record<string, unknown>) {
  const name = texto(body.name, 80);
  if (!name) return { ok: false as const, error: "Poné el nombre de la zona." };

  const slug = slugify(texto(body.slug, 80) ?? name);
  if (!slug) return { ok: false as const, error: "La dirección web (slug) no es válida." };

  const datos = {
    name,
    slug,
    description: texto(body.description, 5000),
    seoTitle: texto(body.seoTitle, 120),
    seoDescription: texto(body.seoDescription, 300),
    sortOrder: entero(body.sortOrder, 0, 0, 9999),
    isActive: body.isActive !== false,
  };
  return { ok: true as const, datos };
}
