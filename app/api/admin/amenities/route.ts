import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { refrescarSitio } from "@/lib/cache";
import { errorJson, esDuplicado, leerJson } from "@/lib/api";
import { datosDeAmenity } from "./datos";

// Crea un amenity.
export async function POST(request: Request) {
  const no = await exigirAdmin();
  if (no) return no;

  const r = datosDeAmenity(await leerJson(request));
  if (!r.ok) return errorJson(r.error);
  const datos = r.datos;

  try {
    const amenity = await prisma.amenity.create({ data: datos });
    refrescarSitio();
    return NextResponse.json(amenity, { status: 201 });
  } catch (e) {
    if (esDuplicado(e)) return errorJson("Ya existe un amenity con ese nombre.", 409);
    console.error("Error creando amenity:", e);
    return errorJson("No se pudo guardar el amenity.", 500);
  }
}
