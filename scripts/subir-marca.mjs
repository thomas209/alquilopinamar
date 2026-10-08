// SUBE EL LOGO A CLOUDINARY.
// Toma los PNG de assets/marca/ y los sube a <CLOUDINARY_FOLDER>/marca/ con
// nombre fijo (logo-horizontal, logo-completo, isotipo, wordmark). Si ya
// existen los reemplaza: para cambiar el logo, cambiar los PNG y correr de nuevo.
// Nunca sube nada fuera de la carpeta del proyecto (la cuenta es compartida).
//
// Uso: npm run marca:subir
import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { leerEnv } from "./_env.mjs";

const env = { ...leerEnv(".env"), ...process.env };
const CLOUD = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = env.CLOUDINARY_API_KEY;
const SECRET = env.CLOUDINARY_API_SECRET;
const CARPETA = (env.CLOUDINARY_FOLDER || "alquilopinamar").replace(/^\/+|\/+$/g, "");
const ORIGEN = path.join("assets", "marca");

function firmar(params) {
  const texto = Object.keys(params).sort().map((k) => k + "=" + params[k]).join("&");
  return createHash("sha1").update(texto + SECRET).digest("hex");
}

try {
  if (!CLOUD || !KEY || !SECRET) throw new Error('Faltan las variables de Cloudinary en ".env".');
  const archivos = fs.readdirSync(ORIGEN).filter((f) => f.endsWith(".png"));
  if (!archivos.length) throw new Error("No hay PNG en " + ORIGEN);

  console.log("\nSubiendo el logo a Cloudinary (" + CLOUD + ") → " + CARPETA + "/marca/\n");
  for (const archivo of archivos) {
    const nombre = path.basename(archivo, ".png");
    const publicId = CARPETA + "/marca/" + nombre;
    if (!publicId.startsWith(CARPETA + "/")) throw new Error("Destino fuera de la carpeta del proyecto: " + publicId);

    const params = { asset_folder: CARPETA + "/marca", invalidate: "true", overwrite: "true", public_id: publicId, timestamp: Math.round(Date.now() / 1000) };
    const cuerpo = new FormData();
    for (const [k, v] of Object.entries(params)) cuerpo.append(k, String(v));
    cuerpo.append("api_key", KEY);
    cuerpo.append("signature", firmar(params));
    cuerpo.append("file", new Blob([fs.readFileSync(path.join(ORIGEN, archivo))], { type: "image/png" }), archivo);

    const res = await fetch("https://api.cloudinary.com/v1_1/" + CLOUD + "/image/upload", { method: "POST", body: cuerpo });
    const datos = await res.json().catch(() => null);
    if (!res.ok) throw new Error(nombre + ": " + (datos?.error?.message ?? "error " + res.status));
    console.log("  ✓ " + nombre.padEnd(16) + datos.width + "×" + datos.height + "  " + datos.secure_url);
  }
  console.log("\nListo. El sitio usa estas imágenes desde Cloudinary.\n");
} catch (e) {
  console.error("\nNo se pudo subir el logo: " + e.message + "\n");
  process.exitCode = 1;
}
