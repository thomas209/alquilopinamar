import { NextResponse } from "next/server";
import { usuarioActual } from "@/lib/usuarios";

// Quien tiene la sesion iniciada en este navegador (o null).
// Lo usa el header y el formulario de consulta, que son paginas en cache.
export async function GET() {
  const user = await usuarioActual();
  return NextResponse.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
}
