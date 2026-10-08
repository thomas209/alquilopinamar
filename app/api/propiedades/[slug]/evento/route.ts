import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson } from "@/lib/api";
import { esRobot } from "@/lib/consultas";

type Contexto = { params: Promise<{ slug: string }> };

// Suma una visita o un clic en WhatsApp a la propiedad (metricas del admin).
// Sin autenticacion; ignora robots. No refresca la cache del sitio.
export async function POST(request: Request, { params }: Contexto) {
  const { slug } = await params;
  const { tipo } = await leerJson(request);
  if (tipo !== "vista" && tipo !== "whatsapp") return errorJson("Evento desconocido.");
  if (esRobot(request)) return NextResponse.json({ ok: true });

  await prisma.property.updateMany({
    where: { slug, status: "PUBLICADA", deletedAt: null },
    data: tipo === "vista" ? { viewCount: { increment: 1 } } : { whatsappClicks: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
