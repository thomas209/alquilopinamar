import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson, texto } from "@/lib/api";
import { propiedadPropia } from "@/lib/panel";

type Contexto = { params: Promise<{ id: string }> };

// Acceso rapido: marcar un periodo como alquilado o disponible, sin pasar por el asistente.
export async function PATCH(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;

  const body = await leerJson(request);
  const rateId = texto(body.rateId, 40);
  if (!rateId || typeof body.isAvailable !== "boolean") return errorJson("Faltan datos.");

  const cambio = await prisma.propertyRate.updateMany({ where: { id: rateId, propertyId: id }, data: { isAvailable: body.isAvailable } });
  if (cambio.count === 0) return errorJson("Ese período ya no existe. Recargá la página.", 404);
  await prisma.property.update({ where: { id }, data: { availabilityUpdatedAt: new Date() } });

  if (permiso.propiedad.status === "PUBLICADA") refrescarSitio();
  return NextResponse.json({ ok: true });
}
