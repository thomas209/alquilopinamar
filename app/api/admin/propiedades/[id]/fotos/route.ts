import { exigirAdmin } from "@/lib/auth";
import { leerJson } from "@/lib/api";
import { ordenarFotos, registrarFoto } from "@/lib/fotos";

type Contexto = { params: Promise<{ id: string }> };

// Registra una foto que el navegador ya subio a Cloudinary.
export async function POST(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;
  return registrarFoto(id, await leerJson(request));
}

// Guarda el orden de las fotos. La primera es la portada.
export async function PATCH(request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;
  return ordenarFotos(id, await leerJson(request));
}
