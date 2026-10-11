// Panel del propietario (Fase 2d): quien es y que puede tocar.
// Un propietario solo ve y edita SUS propiedades (docs/06-business-rules.md).
import { prisma } from "@/lib/prisma";
import { errorJson } from "@/lib/api";
import { datosDePropiedad } from "@/lib/propiedad";
import { usuarioActual, type UsuarioPublico } from "@/lib/usuarios";

export const MAX_PROPIEDADES_POR_USUARIO = 50; // freno contra abusos, no un limite comercial

type Permiso =
  | { ok: true; yo: UsuarioPublico; propiedad: { id: string; code: number; status: string; publishedAt: Date | null; title: string; description: string } }
  | { ok: false; respuesta: Response };

// Usuario con sesion y una propiedad suya (no borrada). Si no es suya responde 404, sin dar pistas.
export async function propiedadPropia(id: string): Promise<Permiso> {
  const yo = await usuarioActual();
  if (!yo) return { ok: false, respuesta: errorJson("Tu sesión se cerró. Volvé a entrar.", 401) };
  const propiedad = await prisma.property.findFirst({
    where: { id, ownerId: yo.id, deletedAt: null },
    select: { id: true, code: true, status: true, publishedAt: true, title: true, description: true },
  });
  if (!propiedad) return { ok: false, respuesta: errorJson("La propiedad no existe.", 404) };
  return { ok: true, yo, propiedad };
}

// Lo mismo que valida el admin, menos lo que solo decide el admin (destacadas).
export function datosDelPropietario(body: Record<string, unknown>) {
  const r = datosDePropiedad(body);
  if (!r.ok) return r;
  const { isFeatured: _f, featuredOrder: _o, ...datos } = r.datos;
  void _f;
  void _o;
  const wa = datos.contactWhatsapp;
  if (wa && wa.replace(/\D/g, "").length < 8) return { ok: false as const, error: "Revisá el WhatsApp de la propiedad: poné código de área y número." };
  return { ...r, datos };
}

// Para mandar a revision: nombre y un telefono o WhatsApp en la cuenta.
export function faltaEnLaCuenta(yo: UsuarioPublico): string[] {
  const falta: string[] = [];
  if (yo.firstName.trim().length < 2) falta.push("tu nombre");
  if (!yo.phone && !yo.whatsapp) falta.push("un teléfono o WhatsApp");
  return falta;
}
