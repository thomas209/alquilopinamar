import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, esDuplicado, leerJson } from "@/lib/api";
import { datosDeZona } from "./datos";

// Crea una zona.
export async function POST(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;

  const r = datosDeZona(await leerJson(request));
  if (!r.ok) return errorJson(r.error);
  const datos = r.datos;

  try {
    const zona = await prisma.zone.create({ data: datos });
    refrescarSitio();
    return NextResponse.json(zona, { status: 201 });
  } catch (e) {
    if (esDuplicado(e)) return errorJson("Ya existe una zona con esa dirección web (slug).", 409);
    console.error("Error creando zona:", e);
    return errorJson("No se pudo guardar la zona.", 500);
  }
}
