import { exigirAdmin } from "@/lib/auth";
import { firmaParaFoto } from "@/lib/fotos";

type Contexto = { params: Promise<{ id: string }> };

// Da el permiso firmado para subir una foto de esta propiedad a Cloudinary.
export async function POST(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id } = await params;
  return firmaParaFoto(id);
}
