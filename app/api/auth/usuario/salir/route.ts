import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESION } from "@/lib/usuarios";

// Cierra la sesion en este navegador.
export async function POST() {
  (await cookies()).delete(COOKIE_SESION);
  return NextResponse.json({ ok: true });
}
