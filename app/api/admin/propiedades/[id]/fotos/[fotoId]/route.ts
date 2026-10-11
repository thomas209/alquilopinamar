import { exigirAdmin } from "@/lib/auth";
import { borrarFoto } from "@/lib/fotos";

type Contexto = { params: Promise<{ id: string; fotoId: string }> };

// Borra una foto: de Cloudinary y de la base.
export async function DELETE(_request: Request, { params }: Contexto) {
  const no = await exigirAdmin();
  if (no) return no;
  const { id, fotoId } = await params;
  return borrarFoto(id, fotoId);
}
