// Ayudas para los endpoints: mismo formato de error en todos lados.
import { NextResponse } from "next/server";

export function errorJson(mensaje: string, status = 400) {
  return NextResponse.json({ error: mensaje }, { status });
}

// Lee el cuerpo JSON del pedido. Si viene roto devuelve un objeto vacio.
export async function leerJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

// Texto recortado, o null si viene vacio.
export function texto(valor: unknown, max = 500): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim().slice(0, max);
  return limpio || null;
}

// Entero dentro de un rango, o el valor por defecto.
export function entero(valor: unknown, porDefecto = 0, min = 0, max = 100000): number {
  const n = typeof valor === "number" ? valor : parseInt(String(valor ?? ""), 10);
  if (!Number.isFinite(n)) return porDefecto;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

// Prisma avisa asi cuando se repite un valor que tiene que ser unico (ej: el slug).
export function esDuplicado(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: string }).code === "P2002";
}
