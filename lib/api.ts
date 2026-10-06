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

// Numero (puede tener decimales) mayor o igual a cero, o null si viene vacio o no es un numero.
export function numero(valor: unknown, max = 1e12): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = typeof valor === "number" ? valor : Number(String(valor).replace(",", "."));
  if (!Number.isFinite(n) || n < 0 || n > max) return null;
  return n;
}

// Entero mayor o igual a cero, o null si viene vacio.
export function enteroONull(valor: unknown, max = 100000): number | null {
  const n = numero(valor, max);
  return n === null ? null : Math.trunc(n);
}

// Coordenada (puede ser negativa), o null.
export function coordenada(valor: unknown, limite: number): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const n = typeof valor === "number" ? valor : Number(String(valor).replace(",", "."));
  if (!Number.isFinite(n) || Math.abs(n) > limite) return null;
  return n;
}

// Fecha "AAAA-MM-DD" -> Date (medianoche UTC), o null.
export function fecha(valor: unknown): Date | null {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
  const d = new Date(valor + "T00:00:00.000Z");
  return Number.isNaN(d.getTime()) ? null : d;
}
