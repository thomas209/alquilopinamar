import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson, texto } from "@/lib/api";
import { CAMPOS_PUBLICOS, usuarioActual } from "@/lib/usuarios";

const TELEFONO = /^[+\d][\d\s()./-]{5,29}$/;
const telefonoValido = (t: string) => TELEFONO.test(t) && t.replace(/\D/g, "").length >= 6;

// Datos de la propia cuenta: nombre, apellido, telefono y WhatsApp.
// El mail no se cambia desde aca (es con lo que se entra).
export async function PATCH(request: Request) {
  const yo = await usuarioActual();
  if (!yo) return errorJson("Tu sesión se cerró. Volvé a entrar.", 401);

  const body = await leerJson(request);
  const firstName = texto(body.firstName, 60) ?? "";
  const lastName = texto(body.lastName, 60) ?? "";
  const phone = texto(body.phone, 30);
  const whatsapp = texto(body.whatsapp, 30);

  if (firstName.length < 2) return NextResponse.json({ error: "Poné tu nombre.", campo: "firstName" }, { status: 400 });
  if (phone && !telefonoValido(phone)) return NextResponse.json({ error: "Revisá el teléfono.", campo: "phone" }, { status: 400 });
  if (whatsapp && !telefonoValido(whatsapp)) return NextResponse.json({ error: "Revisá el WhatsApp.", campo: "whatsapp" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: yo.id },
    data: { firstName, lastName, phone, whatsapp },
    select: CAMPOS_PUBLICOS,
  });
  return NextResponse.json({ user });
}
