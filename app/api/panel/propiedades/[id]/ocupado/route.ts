import { leerJson } from "@/lib/api";
import { guardarOcupados } from "@/lib/ocupado";
import { propiedadPropia } from "@/lib/panel";

type Contexto = { params: Promise<{ id: string }> };

// El propietario guarda las fechas ocupadas de su propiedad (lista completa).
export async function PUT(request: Request, { params }: Contexto) {
  const { id } = await params;
  const permiso = await propiedadPropia(id);
  if (!permiso.ok) return permiso.respuesta;
  return guardarOcupados(id, await leerJson(request), permiso.propiedad.status === "PUBLICADA");
}
