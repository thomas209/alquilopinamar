"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo, CampoArea } from "@/components/ui/Campo";
import Hoja from "@/components/ui/Hoja";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";

export type ZonaFila = {
  id: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  isActive: boolean;
  propiedades: number;
};

// Lista de zonas con alta, edicion y borrado en una hoja.
export default function ZonasAdmin({ zonas }: { zonas: ZonaFila[] }) {
  const router = useRouter();
  // null = hoja cerrada, "nueva" = alta, o la zona que se esta editando
  const [editando, setEditando] = useState<ZonaFila | "nueva" | null>(null);
  const [activa, setActiva] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const zona = editando && editando !== "nueva" ? editando : null;

  function abrir(z: ZonaFila | "nueva") {
    setError("");
    setActiva(z === "nueva" ? true : z.isActive);
    setEditando(z);
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setGuardando(true);
    const cuerpo = {
      name: f.get("name"),
      slug: f.get("slug"),
      description: f.get("description"),
      seoTitle: f.get("seoTitle"),
      seoDescription: f.get("seoDescription"),
      sortOrder: f.get("sortOrder"),
      isActive: activa,
    };
    const res = zona
      ? await pedir("/api/admin/zonas/" + zona.id, "PATCH", cuerpo)
      : await pedir("/api/admin/zonas", "POST", cuerpo);
    setGuardando(false);
    if (!res.ok) return setError(res.error);
    setEditando(null);
    router.refresh();
  }

  async function borrar() {
    if (!zona) return;
    setError("");
    setGuardando(true);
    const res = await pedir("/api/admin/zonas/" + zona.id, "DELETE");
    setGuardando(false);
    if (!res.ok) return setError(res.error);
    setEditando(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Zonas</h1>
        <Boton tamano="chico" onClick={() => abrir("nueva")}>
          Nueva zona
        </Boton>
      </div>

      {zonas.length === 0 ? (
        <p className="mt-8 text-[14px] text-texto-2">Todavía no hay zonas. Creá la primera con “Nueva zona”.</p>
      ) : (
        <ul className="mt-6 border-t border-gris-200">
          {zonas.map((z) => (
            <li key={z.id} className="border-b border-gris-200">
              <button
                type="button"
                onClick={() => abrir(z)}
                className="flex w-full items-center gap-4 py-4 text-left transition-opacity duration-200 hover:opacity-70"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{z.name}</span>
                  <Rotulo className="mt-1.5 block text-[10px]">
                    /zonas/{z.slug} · {z.propiedades} {z.propiedades === 1 ? "propiedad" : "propiedades"}
                  </Rotulo>
                </span>
                <PastillaEstado tono={z.isActive ? "ok" : "neutro"}>{z.isActive ? "Activa" : "Inactiva"}</PastillaEstado>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Hoja abierta={editando !== null} onCerrar={() => setEditando(null)} titulo={zona ? "Editar zona" : "Nueva zona"}>
        {/* key: al cambiar de zona el formulario arranca con sus datos */}
        <form key={zona?.id ?? "nueva"} onSubmit={guardar} className="flex flex-col gap-3.5">
          <Campo etiqueta="Nombre" name="name" defaultValue={zona?.name} required maxLength={80} />
          <Campo
            etiqueta="Dirección web (slug)"
            name="slug"
            defaultValue={zona?.slug}
            placeholder="se arma sola con el nombre"
            ayuda={zona ? "Si la cambiás, el link anterior deja de funcionar." : undefined}
            maxLength={80}
          />
          <CampoArea
            etiqueta="Texto de la página de zona"
            name="description"
            defaultValue={zona?.description}
            rows={5}
            ayuda="Aparece en /zonas y ayuda a que Google la encuentre."
          />
          <Campo etiqueta="Título para Google" name="seoTitle" defaultValue={zona?.seoTitle} maxLength={120} />
          <CampoArea etiqueta="Descripción para Google" name="seoDescription" defaultValue={zona?.seoDescription} rows={2} maxLength={300} />
          <Campo etiqueta="Orden" name="sortOrder" type="number" min={0} defaultValue={zona?.sortOrder ?? zonas.length} ayuda="Las de número más chico van primero." />
          <label className="flex items-center gap-3 py-1 text-[15px]">
            <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} className="size-5 accent-negro" />
            Activa (se muestra en el sitio)
          </label>

          {error && (
            <p role="alert" className="text-[13px] text-error">
              {error}
            </p>
          )}

          <Boton type="submit" tamano="grande" ancho disabled={guardando} className="mt-1">
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          {zona && (
            <Boton variante="texto" className="self-center text-error" disabled={guardando} onClick={borrar}>
              Borrar zona
            </Boton>
          )}
        </form>
      </Hoja>
    </>
  );
}
