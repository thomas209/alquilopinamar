import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { errorJson, leerJson } from "@/lib/api";
import { cloudinaryListo, firmaDeSubidaEn } from "@/lib/cloudinary";
import { leerDestino, subcarpetaDe } from "@/lib/portadas";

// Permiso firmado para subir una foto de portada a Cloudinary.
export async function POST(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;
  if (!cloudinaryListo()) return errorJson("Faltan los datos de Cloudinary en el archivo .env.", 500);

  const destino = leerDestino((await leerJson(request)).destino);
  if (!destino) return errorJson("Destino no válido.");
  if (destino.tipo === "zona" && !(await prisma.zone.findUnique({ where: { slug: destino.slug }, select: { id: true } }))) {
    return errorJson("La zona no existe.", 404);
  }
  return NextResponse.json(firmaDeSubidaEn(subcarpetaDe(destino)));
}
