import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson, texto } from "@/lib/api";
import { borrarDeCloudinary, CARPETA, esNuestra, publicIdDeUrl, subidaValida } from "@/lib/cloudinary";
import { guardarPortada, leerDestino, portadaActual, subcarpetaDe, type Destino } from "@/lib/portadas";

async function existe(d: Destino) {
  return d.tipo === "home" || Boolean(await prisma.zone.findUnique({ where: { slug: d.slug }, select: { id: true } }));
}

// Borra de Cloudinary la portada anterior (solo si es de nuestra carpeta de portadas)
async function borrarAnterior(url: string | null) {
  const id = url ? publicIdDeUrl(url) : null;
  if (id && esNuestra(id) && id.startsWith(CARPETA + "/portadas/")) await borrarDeCloudinary(id).catch(() => false);
}

// Guarda una portada que el navegador ya subio a Cloudinary.
export async function PUT(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;
  const body = await leerJson(request);
  const destino = leerDestino(body.destino);
  if (!destino || !(await existe(destino))) return errorJson("Destino no válido.");

  const publicId = texto(body.publicId, 300);
  const url = texto(body.url, 600);
  const firma = texto(body.signature, 100);
  const version = typeof body.version === "number" ? body.version : NaN;
  if (!publicId || !url || !firma || !Number.isFinite(version)) return errorJson("Faltan datos de la foto.");

  const carpeta = CARPETA + "/" + subcarpetaDe(destino) + "/";
  if (!esNuestra(publicId) || !publicId.startsWith(carpeta) || !subidaValida(publicId, version, firma)) return errorJson("La foto no es válida.");
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes(publicId)) return errorJson("La foto no es válida.");

  const anterior = await portadaActual(destino);
  await guardarPortada(destino, url);
  if (anterior && anterior !== url) await borrarAnterior(anterior);
  refrescarSitio();
  return NextResponse.json({ url });
}

// Quita la portada (vuelve a la de por defecto).
export async function DELETE(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;
  const destino = leerDestino((await leerJson(request)).destino);
  if (!destino || !(await existe(destino))) return errorJson("Destino no válido.");

  const anterior = await portadaActual(destino);
  await guardarPortada(destino, null);
  await borrarAnterior(anterior);
  refrescarSitio();
  return NextResponse.json({ ok: true });
}
