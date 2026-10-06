// URL de una foto de Cloudinary con un tamaño y recorte dados.
// La original se guarda en maxima calidad; esto solo pide una version mas liviana.
export function fotoUrl(url: string, transformacion: string): string {
  return url.includes("/upload/") ? url.replace("/upload/", "/upload/" + transformacion + "/") : url;
}

// Miniatura 4:3 para el admin.
export const miniatura = (url: string) => fotoUrl(url, "c_fill,g_auto,w_480,h_360,q_auto,f_auto");

export const MAX_FOTOS = 40;
export const MAX_PESO_MB = 10; // tope del plan gratis de Cloudinary por imagen
