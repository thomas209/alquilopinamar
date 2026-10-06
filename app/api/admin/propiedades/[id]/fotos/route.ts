import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { enteroONull, errorJson, leerJson, texto } from "@/lib/api";
import { CARPETA, esNuestra, subidaValida } from "@/lib/cloudinary";
import { formatearCodigo } from "@/lib/formato";
import { MAX_FOTOS } from "@/lib/foto";

type Contexto = { params: Promise<{ id: string }> };

// Registra una foto que el navegador ya subio a Cloudinary.
export async function POST(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const body = await leerJson(request);
  const publicId = texto(body.publicId, 300);
  const url = texto(body.url, 600);
  const firma = texto(body.signature, 100);
  const version = typeof body.version === "number" ? body.version : NaN;
  if (!publicId || !url || !firma || !Number.isFinite(version)) return errorJson("Faltan datos de la foto.");

  const p = await prisma.property.findFirst({ where: { id, deletedAt: null }, select: { code: true } });
  if (!p) return errorJson("La propiedad no existe.", 404);

  // Solo se aceptan fotos de la carpeta de ESTA propiedad y con la firma de Cloudinary.
  const carpeta = CARPETA + "/propiedades/" + formatearCodigo(p.code) + "/";
  if (!esNuestra(publicId) || !publicId.startsWith(carpeta) || !subidaValida(publicId, version, firma)) {
    return errorJson("La foto no es válida.");
  }
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes(publicId)) return errorJson("La foto no es válida.");

  const foto = await prisma.$transaction(async (tx) => {
    const ya = await tx.propertyImage.findFirst({ where: { propertyId: id, publicId } });
    if (ya) return ya;
    const cuantas = await tx.propertyImage.count({ where: { propertyId: id } });
    if (cuantas >= MAX_FOTOS) return null;
    const ultima = await tx.propertyImage.findFirst({ where: { propertyId: id }, orderBy: { sortOrder: "desc" }, select: { sortOrder: true } });
    return tx.propertyImage.create({
      data: {
        propertyId: id,
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
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const body = await leerJson(request);
  const orden = Array.isArray(body.orden) ? body.orden.filter((x): x is string => typeof x === "string") : [];

  const actuales = await prisma.propertyImage.findMany({ where: { propertyId: id }, select: { id: true } });
  const mismas = orden.length === actuales.length && new Set(orden).size === orden.length && actuales.every((f) => orden.includes(f.id));
  if (!mismas) return errorJson("Las fotos cambiaron. Recargá la página y probá de nuevo.", 409);

  await prisma.$transaction(orden.map((fotoId, i) => prisma.propertyImage.update({ where: { id: fotoId }, data: { sortOrder: i } })));
  refrescarSitio();
  return NextResponse.json({ ok: true });
}
