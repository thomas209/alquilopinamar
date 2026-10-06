// Link para abrir un chat de WhatsApp con el mensaje ya escrito.
// Si la propiedad no tiene numero propio se usa el del sitio (NEXT_PUBLIC_WHATSAPP).
export function numeroWhatsapp(delAviso: string | null): string | null {
  const n = (delAviso || process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");
  return n.length >= 8 ? n : null;
}

export function linkWhatsapp(numero: string, mensaje: string): string {
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
}
