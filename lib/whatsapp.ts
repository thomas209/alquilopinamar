// Link para abrir un chat de WhatsApp con el mensaje ya escrito.
// Si la propiedad no tiene numero propio se usa el del sitio (NEXT_PUBLIC_WHATSAPP).
export function numeroWhatsapp(delAviso: string | null): string | null {
  const n = (delAviso || process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");
  return n.length >= 8 ? n : null;
}

export function linkWhatsapp(numero: string, mensaje: string): string {
  return "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
}

// Telefono que dejo alguien en una consulta -> numero para wa.me.
// Acepta formatos argentinos comunes: "011 15-1234-5678", "+54 9 2254 123456", "2254 12-3456".
export function whatsappDeTelefono(telefono: string | null): string | null {
  if (!telefono) return null;
  let n = telefono.replace(/\D/g, "");
  if (telefono.trim().startsWith("+")) return n.length >= 8 ? n : null; // ya trae codigo de pais
  if (n.startsWith("00")) return n.slice(2);
  if (n.startsWith("54")) n = n.slice(2);
  n = n.replace(/^0/, "");
  if (n.startsWith("9") && n.length === 11) n = n.slice(1);
  // Saca el "15" del celular: 11 15 1234 5678 -> 11 1234 5678 (prueba codigos de area de 2 a 4 cifras)
  if (n.length === 12) {
    for (const largo of [2, 3, 4]) {
      if (n.slice(largo, largo + 2) === "15") {
        n = n.slice(0, largo) + n.slice(largo + 2);
        break;
      }
    }
  }
  return n.length === 10 ? "549" + n : null;
}
