import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, leerJson } from "@/lib/api";
import { faltaParaPublicar, mensajeFalta } from "@/lib/propiedad";

type Contexto = { params: Promise<{ id: string }> };

const PERMITIDOS = ["PUBLICADA", "PAUSADA", "BORRADOR"] as const;

// Cambia el estado: publicar, pausar o volver a borrador.
export async function POST(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;

  const body = await leerJson(request);
  const status = PERMITIDOS.find((s) => s === body.status);
  if (!status) return errorJson("Estado no válido.");

  const p = await prisma.property.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { images: true } } },
  });
  if (!p) return errorJson("La propiedad no existe.", 404);

  if (status === "PUBLICADA") {
    const falta = faltaParaPublicar({ ...p, fotos: p._count.images });
    if (falta.length) return errorJson(mensajeFalta(falta));
  }

  await prisma.property.update({
    where: { id },
    data: {
      status,
      rejectionReason: null,
      ...(status === "PUBLICADA" && !p.publishedAt ? { publishedAt: new Date() } : {}),
    },
  });
  refrescarSitio();
  return NextResponse.json({ ok: true, status });
}
