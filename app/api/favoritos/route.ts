import { NextResponse } from "next/server";
import { leerLista } from "@/lib/favoritos";
import { propiedadesPorSlugs } from "@/lib/sitio";

// Solo lectura: las cards actuales de las propiedades guardadas en favoritos.
// Las que ya no estan publicadas no vuelven (la pagina las marca "No disponible").
export async function GET(request: Request) {
  const slugs = leerLista(new URL(request.url).searchParams.get("slugs") ?? undefined);
  const propiedades = await propiedadesPorSlugs(slugs);
  return NextResponse.json({ propiedades }, { headers: { "Cache-Control": "no-store" } });
}
