import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson } from "@/lib/api";
import { borrarDeCloudinary, esNuestra } from "@/lib/cloudinary";
import { MIN_FOTOS, MIN_FOTOS_LOTE } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string; fotoId: string }> };

// Borra una foto: de Cloudinary y de la base.
export async function DELETE(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id, fotoId } = await params;

  const foto = await prisma.propertyImage.findFirst({
    where: { id: fotoId, propertyId: id },
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
    const resto = await tx.propertyImage.findMany({ where: { propertyId: id }, orderBy: { sortOrder: "asc" }, select: { id: true } });
    for (let i = 0; i < resto.length; i++) await tx.propertyImage.update({ where: { id: resto[i].id }, data: { sortOrder: i } });
  });

  refrescarSitio();
  return NextResponse.json({ ok: true });
}
