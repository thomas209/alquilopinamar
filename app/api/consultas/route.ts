import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson } from "@/lib/api";
import { datosDeConsulta, hashDeIp, MAX_CONSULTAS_POR_HORA } from "@/lib/consultas";
import { avisarConsultaNueva } from "@/lib/email";

// Consulta desde la ficha de una propiedad. Publico, sin cuenta.
// Guarda la consulta y avisa por mail al admin (el mail nunca frena la consulta).
export async function POST(request: Request) {
  const body = await leerJson(request);

  // Campo trampa: las personas no lo ven; si viene lleno es un robot.
  // Se responde como si estuviera todo bien para no darle pistas.
  if (typeof body.sitio === "string" && body.sitio.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const r = datosDeConsulta(body);
  if (!r.ok) return NextResponse.json({ error: r.error, campo: r.campo }, { status: 400 });
  const { propertySlug, ...datos } = r.datos;

  const propiedad = await prisma.property.findFirst({
    where: { slug: propertySlug, status: "PUBLICADA", deletedAt: null },
    select: { id: true, code: true, slug: true, title: true, operation: true, zone: { select: { name: true } } },
  });
  if (!propiedad) return errorJson("Esta propiedad ya no está publicada.", 404);

  const ipHash = hashDeIp(request);
  const recientes = await prisma.inquiry.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      OR: [{ email: datos.email }, ...(ipHash ? [{ ipHash }] : [])],
    },
  });
  if (recientes >= MAX_CONSULTAS_POR_HORA) {
    return errorJson("Recibimos varias consultas tuyas en poco tiempo. Probá de nuevo en un rato o escribí por WhatsApp.", 429);
  }

  try {
    const consulta = await prisma.inquiry.create({
      data: { ...datos, propertyId: propiedad.id, ipHash },
      select: { id: true, createdAt: true },
    });

    // El mail sale despues de responder: la persona no espera a Resend.
    after(() =>
      avisarConsultaNueva({
        id: consulta.id,
        recibida: consulta.createdAt,
        ...datos,
        propiedad: { code: propiedad.code, slug: propiedad.slug, title: propiedad.title, operation: propiedad.operation, zona: propiedad.zone.name },
      }),
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Error guardando consulta:", e);
    return errorJson("No pudimos enviar la consulta. Probá de nuevo.", 500);
  }
}
