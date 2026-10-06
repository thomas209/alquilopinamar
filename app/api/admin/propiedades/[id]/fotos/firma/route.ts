import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { errorJson } from "@/lib/api";
import { cloudinaryListo, firmaDeSubida } from "@/lib/cloudinary";
import { formatearCodigo } from "@/lib/formato";
import { MAX_FOTOS } from "@/lib/foto";

type Contexto = { params: Promise<{ id: string }> };

// Da el permiso firmado para subir una foto de esta propiedad a Cloudinary.
export async function POST(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  if (!cloudinaryListo()) return errorJson("Faltan los datos de Cloudinary en el archivo .env.", 500);

  const p = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    select: { code: true, _count: { select: { images: true } } },
  });
  if (!p) return errorJson("La propiedad no existe.", 404);
  if (p._count.images >= MAX_FOTOS) return errorJson("Esta propiedad ya tiene el máximo de " + MAX_FOTOS + " fotos.");

  return NextResponse.json(firmaDeSubida(formatearCodigo(p.code)));
}
