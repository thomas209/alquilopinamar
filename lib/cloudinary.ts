// Cloudinary desde el servidor, sin SDK: firma de subidas y borrado de fotos.
// La cuenta se comparte con otro proyecto, asi que TODO lo de este sitio vive
// adentro de la carpeta CLOUDINARY_FOLDER y nunca se toca nada de afuera.
import { createHash, randomUUID } from "crypto";

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const KEY = process.env.CLOUDINARY_API_KEY ?? "";
const SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

export const CARPETA = (process.env.CLOUDINARY_FOLDER || "alquilopinamar").replace(/^\/+|\/+$/g, "");

export function cloudinaryListo(): boolean {
  return Boolean(CLOUD && KEY && SECRET && CARPETA);
}

// Firma de Cloudinary: parametros ordenados "a=1&b=2" + secreto, en SHA-1.
function firmar(params: Record<string, string | number>): string {
  const texto = Object.keys(params)
    .sort()
    .map((k) => k + "=" + params[k])
    .join("&");
  return createHash("sha1").update(texto + SECRET).digest("hex");
}

// true solo si la foto esta adentro de la carpeta de este proyecto.
export function esNuestra(publicId: string): boolean {
  return publicId.startsWith(CARPETA + "/") && !publicId.includes("..");
}

// Permiso para que el navegador suba UNA foto directo a Cloudinary (sin pasar
// por nuestro servidor: asi no hay limite de peso ni se pierde calidad).
export function firmaDeSubida(codigo: string) {
  const carpeta = CARPETA + "/propiedades/" + codigo;
  const params = {
    asset_folder: carpeta, // donde se ve en la biblioteca de Cloudinary
    public_id: carpeta + "/" + randomUUID().replace(/-/g, "").slice(0, 16),
    timestamp: Math.round(Date.now() / 1000),
  };
  return {
    url: "https://api.cloudinary.com/v1_1/" + CLOUD + "/image/upload",
    campos: { ...params, api_key: KEY, signature: firmar(params) },
  };
}

// Confirma que la respuesta de una subida la emitio Cloudinary para esta cuenta.
export function subidaValida(publicId: string, version: number, firma: string): boolean {
  return firmar({ public_id: publicId, version }) === firma;
}

// Borra una foto de Cloudinary. Se niega si no esta en la carpeta de este proyecto.
export async function borrarDeCloudinary(publicId: string): Promise<boolean> {
  if (!esNuestra(publicId)) throw new Error("Foto fuera de la carpeta del proyecto: " + publicId);
  const params = { invalidate: "true", public_id: publicId, timestamp: Math.round(Date.now() / 1000) };
  const cuerpo = new URLSearchParams({ ...params, timestamp: String(params.timestamp), api_key: KEY, signature: firmar(params) });
  const res = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD + "/image/destroy", { method: "POST", body: cuerpo });
  const datos = (await res.json().catch(() => null)) as { result?: string } | null;
  // "not found" tambien vale: ya no esta
  return res.ok && (datos?.result === "ok" || datos?.result === "not found");
}
