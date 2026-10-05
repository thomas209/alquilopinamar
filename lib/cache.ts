import { revalidatePath, revalidateTag } from "next/cache";

// La parte publica guarda en cache la home y los listados para responder al
// instante. Cuando se cambia algo desde el admin (o el panel) se llama a esto
// y los visitantes ven el cambio enseguida, sin esperar a que venza la cache.
export const TAG_SITIO = "sitio";

export function refrescarSitio() {
  try {
    revalidateTag(TAG_SITIO, { expire: 0 });
    revalidatePath("/");
  } catch {
    // si falla el refresco no rompemos el guardado: la cache vence sola
  }
}
