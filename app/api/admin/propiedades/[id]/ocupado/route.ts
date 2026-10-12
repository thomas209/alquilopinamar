import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { errorJson, leerJson } from "@/lib/api";
import { guardarOcupados } from "@/lib/ocupado";

type Contexto = { params: Promise<{ id: string }> };

// El admin guarda las fechas ocupadas de cualquier propiedad (lista completa).
export async function PUT(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;
  const p = await prisma.property.findFirst({ where: { id, deletedAt: null }, select: { status: true } });
  if (!p) return errorJson("La propiedad no existe.", 404);
  return guardarOcupados(id, await leerJson(request), p.status === "PUBLICADA");
}
