// Logo de AlquiloPinamar. Los originales estan en assets/marca/ y se suben a
// Cloudinary con "npm run marca:subir" (carpeta <CLOUDINARY_FOLDER>/marca/).
// Aca se arman las URLs: Cloudinary entrega el formato y el tamaño justos.
const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dklvmlzds";
const CARPETA = (process.env.CLOUDINARY_FOLDER || "alquilopinamar").replace(/^\/+|\/+$/g, "");

export type PiezaMarca = "logo-horizontal" | "logo-completo" | "isotipo";

// Proporcion ancho/alto de cada pieza (para reservar el lugar y que no salte la pagina)
export const PROPORCION: Record<PiezaMarca, number> = {
  "logo-horizontal": 1400 / 360,
  "logo-completo": 657 / 493,
  isotipo: 340 / 360,
};

// URL a un alto dado (en px reales: para pantallas retina pedir el doble o el triple)
export function urlMarca(pieza: PiezaMarca, alto: number, formato: "auto" | "png" = "auto"): string {
  return "https://res.cloudinary.com/" + CLOUD + "/image/upload/f_" + formato + ",q_auto,h_" + Math.round(alto) + "/" + CARPETA + "/marca/" + pieza;
}
