import { imagenOg } from "@/lib/og";
import { fotoUrl } from "@/lib/foto";
import { leerLista, limpiarNombre, tituloLista } from "@/lib/favoritos";
import { propiedadesPorSlugs } from "@/lib/sitio";

// Imagen para compartir una lista de favoritos: la foto de la primera y el titulo.
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const nombre = limpiarNombre(sp.get("de") ?? undefined);
  const propiedades = await propiedadesPorSlugs(leerLista(sp.get("p") ?? undefined));
  const foto = propiedades.find((p) => p.fotos[0])?.fotos[0];
  const n = propiedades.length;
  const imagen = await imagenOg({
    rotulo: "Favoritos · AlquiloPinamar",
    titulo: tituloLista(nombre),
    pie: n === 0 ? "Pinamar y alrededores" : n === 1 ? "1 propiedad guardada" : n + " propiedades guardadas",
    foto: foto ? fotoUrl(foto, "c_fill,g_auto,w_1200,h_630,q_auto,f_jpg") : null,
  });
  imagen.headers.set("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return imagen;
}
