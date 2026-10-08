// Reglas de las consultas (docs/06-business-rules.md → Consultas).
import { createHash } from "node:crypto";
import { entero, fecha, texto } from "@/lib/api";

export const MAX_CONSULTAS_POR_HORA = 5;
export const LARGO_MENSAJE = { min: 10, max: 2000 };

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEFONO = /^[+\d][\d\s()./-]{5,29}$/;
const DIA = 86_400_000;

export type DatosConsulta = {
  propertySlug: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number | null;
};

type Resultado = { ok: true; datos: DatosConsulta } | { ok: false; error: string; campo?: string };

// Valida lo que manda el formulario. Los mensajes son para mostrarle a la persona.
export function datosDeConsulta(body: Record<string, unknown>): Resultado {
  const propertySlug = texto(body.propertySlug, 200);
  if (!propertySlug) return { ok: false, error: "Falta la propiedad." };

  const name = texto(body.name, 80);
  if (!name || name.length < 2) return { ok: false, error: "Poné tu nombre.", campo: "name" };

  const email = texto(body.email, 120)?.toLowerCase() ?? null;
  if (!email || !MAIL.test(email)) return { ok: false, error: "Revisá el mail: no parece válido.", campo: "email" };

  const phone = texto(body.phone, 30);
  if (phone && (!TELEFONO.test(phone) || phone.replace(/\D/g, "").length < 6)) {
    return { ok: false, error: "Revisá el teléfono.", campo: "phone" };
  }

  const message = texto(body.message, LARGO_MENSAJE.max);
  if (!message || message.length < LARGO_MENSAJE.min) return { ok: false, error: "Escribí un mensaje un poco más largo.", campo: "message" };

  const checkIn = fecha(body.checkIn);
  const checkOut = fecha(body.checkOut);
  if (checkIn || checkOut) {
    if (!checkIn || !checkOut) return { ok: false, error: "Completá las dos fechas, o dejalas vacías.", campo: "checkIn" };
    const hoy = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
    if (checkIn.getTime() < hoy - DIA) return { ok: false, error: "La fecha de llegada ya pasó.", campo: "checkIn" };
    if (checkOut <= checkIn) return { ok: false, error: "La salida tiene que ser después de la llegada.", campo: "checkOut" };
    if (checkOut.getTime() - checkIn.getTime() > 366 * DIA) return { ok: false, error: "La estadía no puede superar un año.", campo: "checkOut" };
  }

  const guests = body.guests === undefined || body.guests === null || body.guests === "" ? null : entero(body.guests, 1, 1, 50);

  return { ok: true, datos: { propertySlug, name, email, phone, message, checkIn, checkOut, guests } };
}

// IP de quien consulta, guardada solo como hash (sirve para el limite, no identifica a nadie).
export function hashDeIp(request: Request): string | null {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim();
  if (!ip) return null;
  return createHash("sha256")
    .update(ip + (process.env.NEXTAUTH_SECRET ?? ""))
    .digest("hex")
    .slice(0, 32);
}

// Robots y vistas previas de links: no cuentan como visitas ni clics.
export function esRobot(request: Request): boolean {
  const ua = request.headers.get("user-agent") ?? "";
  return !ua || /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i.test(ua);
}
