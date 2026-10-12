import { firmaParaFoto } from "@/lib/fotos";
import { propiedadPropia } from "@/lib/panel";

type Contexto = { params: Promise<{ id: string }> };

// Permiso firmado para subir una foto de una propiedad propia a Cloudinary.
export async function POST(_request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  return firmaParaFoto(id);
}
