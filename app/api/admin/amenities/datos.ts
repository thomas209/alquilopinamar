import { entero, texto } from "@/lib/api";
import { slugify } from "@/lib/slug";

// Valida y ordena lo que llega del formulario de amenity.
export function datosDeAmenity(body: Record<string, unknown>) {
  const name = texto(body.name, 60);
  if (!name) return { ok: false as const, error: "Poné el nombre del amenity." };

  const slug = slugify(texto(body.slug, 60) ?? name);
  if (!slug) return { ok: false as const, error: "El nombre no es válido." };

  const datos = {
    name,
    slug,
    sortOrder: entero(body.sortOrder, 0, 0, 9999),
    isActive: body.isActive !== false,
  };
  return { ok: true as const, datos };
}
