// Favoritos: viven en el navegador (store/favoritos.ts), sin cuenta y sin tabla.
// La lista se comparte con un link que lleva los codigos adentro.
// Este archivo lo usan el navegador y el servidor (pagina /lista).

export const MAX_FAVORITOS = 40;
const SLUG = /^[a-z0-9-]{1,120}$/;

export const slugValido = (s: string) => SLUG.test(s);

// Link de una lista: /lista?de=Nombre&p=slug1,slug2
export function rutaLista(slugs: string[], nombre: string): string {
  const de = limpiarNombre(nombre);
  const p = slugs.filter(slugValido).slice(0, MAX_FAVORITOS).join(",");
  return "/lista?" + (de ? "de=" + encodeURIComponent(de) + "&" : "") + "p=" + p;
}

// Slugs de un link de lista (sin repetidos, maximo 40). Lo que no es valido se ignora.
export function leerLista(p: string | string[] | undefined): string[] {
  const texto = Array.isArray(p) ? p[0] : p;
  if (!texto) return [];
  const vistos = new Set<string>();
  for (const parte of texto.split(",")) {
    const s = parte.trim().toLowerCase();
    if (slugValido(s)) vistos.add(s);
    if (vistos.size >= MAX_FAVORITOS) break;
  }
  return [...vistos];
}

export function limpiarNombre(nombre: string | string[] | undefined): string {
  const t = Array.isArray(nombre) ? nombre[0] : nombre;
  return (t ?? "").replace(/[<>"]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
}

export const tituloLista = (nombre: string) => (nombre ? "La selección de " + nombre : "Una selección de propiedades");
