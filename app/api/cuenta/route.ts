import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorJson, leerJson, texto } from "@/lib/api";
import { usuarioActual } from "@/lib/usuarios";

// Guarda los datos de la cuenta (nombre, apellido, telefono / WhatsApp).
export async function PATCH(request: Request) {
  const u = await usuarioActual();
  if (!u) return errorJson("Tu sesión venció. Volvé a entrar.", 401);

  const body = await leerJson(request);
  const telefono = texto(body.phone, 40);
  if (telefono && !/^[+\d][\d\s()-]{6,}$/.test(telefono)) return errorJson("Revisá el teléfono: solo números, espacios y guiones.");

  const datos = await prisma.user.update({
    where: { id: u.id },
    data: { firstName: texto(body.firstName, 60) ?? "", lastName: texto(body.lastName, 60) ?? "", phone: telefono },
    select: { firstName: true, lastName: true, phone: true },
  });
  return NextResponse.json(datos);
}
