import { prisma } from "@/lib/prisma";
import { borrarFoto } from "@/lib/fotos";
import { propiedadPropia } from "@/lib/panel";

type Contexto = { params: Promise<{ id: string; fotoId: string }> };

export async function DELETE(_request: Request, { params }: Contexto) {
  const { id, fotoId } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  const respuesta = await borrarFoto(id, fotoId);
  if (respuesta.ok && permiso.propiedad.status === "PUBLICADA") await prisma.property.update({ where: { id }, data: { needsReview: true } });
  return respuesta;
}
