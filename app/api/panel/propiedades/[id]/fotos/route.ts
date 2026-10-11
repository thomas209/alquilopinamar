import { prisma } from "@/lib/prisma";
import { leerJson } from "@/lib/api";
import { ordenarFotos, registrarFoto } from "@/lib/fotos";
import { propiedadPropia } from "@/lib/panel";

type Contexto = { params: Promise<{ id: string }> };

// Si esta publicada, un cambio de fotos sale al instante pero queda para revisar.
async function marcarParaRevisar(id: string, status: string, respuesta: Response) {
  if (respuesta.ok && status === "PUBLICADA") await prisma.property.update({ where: { id }, data: { needsReview: true } });
  return respuesta;
}

export async function POST(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  return marcarParaRevisar(id, permiso.propiedad.status, await registrarFoto(id, await leerJson(request)));
}

export async function PATCH(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  return marcarParaRevisar(id, permiso.propiedad.status, await ordenarFotos(id, await leerJson(request)));
}
