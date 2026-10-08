import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { errorJson, leerJson, texto } from "@/lib/api";
import { ESTADOS_CONSULTA, type EstadoConsulta } from "@/lib/etiquetas";

type Contexto = { params: Promise<{ id: string }> };

// Cambia el estado de una consulta y/o sus notas internas.
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;
  const body = await leerJson(request);

  const data: { status?: EstadoConsulta; adminNotes?: string | null } = {};
  if (body.status !== undefined) {
    const estado = ESTADOS_CONSULTA.find((e) => e.valor === body.status)?.valor;
    if (!estado) return errorJson("Estado no válido.");
    data.status = estado;
  }
  if (body.adminNotes !== undefined) data.adminNotes = texto(body.adminNotes, 5000);
  if (Object.keys(data).length === 0) return errorJson("No hay nada para cambiar.");

  const existe = await prisma.inquiry.findUnique({ where: { id }, select: { id: true } });
  if (!existe) return errorJson("La consulta no existe.", 404);

  const consulta = await prisma.inquiry.update({ where: { id }, data, select: { id: true, status: true, adminNotes: true } });
  return NextResponse.json(consulta);
}
