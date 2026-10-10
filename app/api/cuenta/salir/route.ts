import { NextResponse } from "next/server";
import { COOKIE_SESION, OPCIONES_COOKIE } from "@/lib/sesion-firma";

// Cierra la sesion en este navegador.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_SESION, "", { ...OPCIONES_COOKIE, maxAge: 0 });
  return res;
}
