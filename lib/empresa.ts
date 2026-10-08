// Datos de contacto y legales del sitio, en un solo lugar.
// Salen de variables de entorno para poder completarlos sin tocar el codigo
// (ver .env.example). Lo que no este cargado simplemente no se muestra.
import { numeroWhatsapp } from "@/lib/whatsapp";

const env = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

export const EMPRESA = {
  nombre: "AlquiloPinamar",
  // Titular del sitio y responsable de los datos personales (persona o empresa)
  titular: env(process.env.NEXT_PUBLIC_TITULAR),
  cuit: env(process.env.NEXT_PUBLIC_CUIT),
  domicilio: env(process.env.NEXT_PUBLIC_DOMICILIO),
  email: env(process.env.NEXT_PUBLIC_EMAIL_CONTACTO),
  whatsapp: numeroWhatsapp(null), // el del sitio (NEXT_PUBLIC_WHATSAPP)
  instagram: env(process.env.NEXT_PUBLIC_INSTAGRAM)?.replace(/^@/, "") ?? null,
};

// Fecha de la ultima version de los textos legales (cambiarla al editarlos)
export const LEGALES_ACTUALIZADOS = "8 de octubre de 2026";

// "+54 9 2254 12-3456" a partir de "5492254123456" (solo para mostrar)
export function whatsappLegible(n: string): string {
  const m = n.match(/^549(\d{2,4})(\d{6,8})$/);
  if (!m) return "+" + n;
  const [, area, resto] = m;
  return "+54 9 " + area + " " + resto.slice(0, resto.length - 4) + "-" + resto.slice(-4);
}
