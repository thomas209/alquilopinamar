// Fotos de una propiedad: lo comun al admin y al panel del propietario.
// Cada endpoint verifica antes quien es y si puede tocar esa propiedad;
// estas funciones hacen el resto y devuelven la respuesta lista.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refrescarSitio } from "@/lib/cache";
import { enteroONull, errorJson, texto } from "@/lib/api";
import { borrarDeCloudinary, CARPETA, cloudinaryListo, esNuestra, firmaDeSubida, subidaValida } from "@/lib/cloudinary";
import { formatearCodigo } from "@/lib/formato";
import { MAX_FOTOS } from "@/lib/foto";
import { MIN_FOTOS, MIN_FOTOS_LOTE } from "@/lib/propiedad";

// Permiso firmado para subir una foto de esta propiedad a Cloudinary.
export async function firmaParaFoto(propertyId: string) {
  if (!cloudinaryListo()) return errorJson("Faltan los datos de Cloudinary en el archivo .env.", 500);
  const p = await prisma.property.findFirst({
    where: { id: propertyId, deletedAt: null },
    select: { code: true, _count: { select: { images: true } } },
  });
  if (!p) return errorJson("La propiedad no existe.", 404);
  if (p._count.images >= MAX_FOTOS) return errorJson("Esta propiedad ya tiene el máximo de " + MAX_FOTOS + " fotos.");
  return NextResponse.json(firmaDeSubida(formatearCodigo(p.code)));
}

// Registra una foto que el navegador ya subio a Cloudinary.
export async function registrarFoto(propertyId: string, body: Record<string, unknown>) {
  const publicId = texto(body.publicId, 300);
  const url = texto(body.url, 600);
  const firma = texto(body.signature, 100);
  const version = typeof body.version === "number" ? body.version : NaN;
  if (!publicId || !url || !firma || !Number.isFinite(version)) return errorJson("Faltan datos de la foto.");

  const p = await prisma.property.findFirst({ where: { id: propertyId, deletedAt: null }, select: { code: true } });
  if (!p) return errorJson("La propiedad no existe.", 404);

  // Solo se aceptan fotos de la carpeta de ESTA propiedad y con la firma de Cloudinary.
  const carpeta = CARPETA + "/propiedades/" + formatearCodigo(p.code) + "/";
  if (!esNuestra(publicId) || !publicId.startsWith(carpeta) || !subidaValida(publicId, version, firma)) {
    return errorJson("La foto no es válida.");
  }
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes(publicId)) return errorJson("La foto no es válida.");

  const foto = await prisma.$transaction(async (tx) => {
    const ya = await tx.propertyImage.findFirst({ where: { propertyId, publicId } });
    if (ya) return ya;
    const cuantas = await tx.propertyImage.count({ where: { propertyId } });
    if (cuantas >= MAX_FOTOS) return null;
    const ultima = await tx.propertyImage.findFirst({ where: { propertyId }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    return tx.propertyImage.create({
      data: {
        propertyId,
        publicId,
        url,
        width: enteroONull(body.width),
        height: enteroONull(body.height),
        sortOrder: ultima ? ultima.sortOrder + 1 : 0,
      },
    });
  });
  if (!foto) return errorJson("Esta propiedad ya tiene el máximo de " + MAX_FOTOS + " fotos.");

  refrescarSitio();
  return NextResponse.json({ id: foto.id, url: foto.url });
}

// Guarda el orden de las fotos. La primera es la portada.
export async function ordenarFotos(propertyId: string, body: Record<string, unknown>) {
  const orden = Array.isArray(body.orden) ? body.orden.filter((x): x is string => typeof x === "string") : [];

  const actuales = await prisma.propertyImage.findMany({ where: { propertyId }, select: { id: true } });
  const mismas = orden.length === actuales.length && new Set(orden).size === orden.length && actuales.every((f) => orden.includes(f.id));
  if (!mismas) return errorJson("Las fotos cambiaron. Recargá la página y probá de nuevo.", 409);

  await prisma.$transaction(orden.map((fotoId, i) => prisma.propertyImage.update({ where: { id: fotoId }, data: { sortOrder: i } })));
  refrescarSitio();
  return NextResponse.json({ ok: true });
}

// Borra una foto: de Cloudinary y de la base.
export async function borrarFoto(propertyId: string, fotoId: string) {
  const foto = await prisma.propertyImage.findFirst({
    where: { id: fotoId, propertyId },
    include: { property: { select: { status: true, type: true, _count: { select: { images: true } } } } },
  });
  if (!foto) return errorJson("La foto no existe.", 404);

  // Una propiedad publicada no puede quedar por debajo del minimo de fotos.
  const minimo = foto.property.type === "LOTE" ? MIN_FOTOS_LOTE : MIN_FOTOS;
  if (foto.property.status === "PUBLICADA" && foto.property._count.images <= minimo) {
    return errorJson("Una propiedad publicada necesita al menos " + minimo + " fotos. Subí otra antes de borrar esta, o pausala.");
  }

  // Nunca se borra nada de Cloudinary que este fuera de la carpeta de este proyecto.
  if (!esNuestra(foto.publicId)) return errorJson("Esa foto no pertenece a este sitio y no se puede borrar.", 400);

  try {
    const ok = await borrarDeCloudinary(foto.publicId);
    if (!ok) return errorJson("No se pudo borrar la foto. Probá de nuevo.", 502);
  } catch (e) {
    console.error("Error borrando foto de Cloudinary:", e);
    return errorJson("No se pudo borrar la foto. Probá de nuevo.", 502);
  }

  await prisma.$transaction(async (tx) => {
    await tx.propertyImage.delete({ where: { id: fotoId } });
    const resto = await tx.propertyImage.findMany({ where: { propertyId }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    for (let i = 0; i < resto.length; i++) await tx.propertyImage.update({ where: { id: resto[i].id }, data: { sortOrder: i } });
  });

  refrescarSitio();
  return NextResponse.json({ ok: true });
}
