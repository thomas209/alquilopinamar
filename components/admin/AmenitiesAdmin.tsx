"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Hoja from "@/components/ui/Hoja";
import { PastillaEstado } from "@/components/ui/Pastilla";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";

export type AmenityFila = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  propiedades: number;
};

// Lista de amenities con alta, edicion y borrado en una hoja.
export default function AmenitiesAdmin({ amenities }: { amenities: AmenityFila[] }) {
  const router = useRouter();
  const [editando, setEditando] = useState<AmenityFila | "nuevo" | null>(null);
  const [activo, setActivo] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const amenity = editando && editando !== "nuevo" ? editando : null;

  function abrir(a: AmenityFila | "nuevo") {
    setError("");
    setActivo(a === "nuevo" ? true : a.isActive);
    setEditando(a);
  }

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setGuardando(true);
    const cuerpo = { name: f.get("name"), sortOrder: f.get("sortOrder"), isActive: activo };
    const res = amenity
      ? await pedir("/api/admin/amenities/" + amenity.id, "PATCH", cuerpo)
      : await pedir("/api/admin/amenities", "POST", cuerpo);
    setGuardando(false);
    if (!res.ok) return setError(res.error);
    setEditando(null);
    router.refresh();
  }

  async function borrar() {
    if (!amenity) return;
    setError("");
    setGuardando(true);
    const res = await pedir("/api/admin/amenities/" + amenity.id, "DELETE");
    setGuardando(false);
    if (!res.ok) return setError(res.error);
    setEditando(null);
    router.refresh();
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-titulo text-[28px] leading-tight font-semibold tracking-[-0.02em] md:text-[34px]">Amenities</h1>
        <Boton tamano="chico" onClick={() => abrir("nuevo")}>
          Nuevo amenity
        </Boton>
      </div>

      {amenities.length === 0 ? (
        <p className="mt-8 text-[14px] text-texto-2">Todavía no hay amenities. Creá el primero con “Nuevo amenity”.</p>
      ) : (
        <ul className="mt-6 border-t border-gris-200">
          {amenities.map((a) => (
            <li key={a.id} className="border-b border-gris-200">
              <button
                type="button"
                onClick={() => abrir(a)}
                className="flex w-full items-center gap-4 py-4 text-left transition-opacity duration-200 hover:opacity-70"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium">{a.name}</span>
                  <Rotulo className="mt-1.5 block text-[10px]">
                    {a.propiedades} {a.propiedades === 1 ? "propiedad" : "propiedades"}
                  </Rotulo>
                </span>
                <PastillaEstado tono={a.isActive ? "ok" : "neutro"}>{a.isActive ? "Activo" : "Inactivo"}</PastillaEstado>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Hoja abierta={editando !== null} onCerrar={() => setEditando(null)} titulo={amenity ? "Editar amenity" : "Nuevo amenity"}>
        <form key={amenity?.id ?? "nuevo"} onSubmit={guardar} className="flex flex-col gap-3.5">
          <Campo etiqueta="Nombre" name="name" defaultValue={amenity?.name} required maxLength={60} />
          <Campo etiqueta="Orden" name="sortOrder" type="number" min={0} defaultValue={amenity?.sortOrder ?? amenities.length} ayuda="Los de número más chico van primero." />
          <label className="flex items-center gap-3 py-1 text-[15px]">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="size-5 accent-negro" />
            Activo (se puede elegir al cargar una propiedad)
          </label>

          {error && (
            <p role="alert" className="text-[13px] text-error">
              {error}
            </p>
          )}

          <Boton type="submit" tamano="grande" ancho disabled={guardando} className="mt-1">
            {guardando ? "Guardando…" : "Guardar"}
          </Boton>
          {amenity && (
            <Boton variante="texto" className="self-center text-error" disabled={guardando} onClick={borrar}>
              Borrar amenity
            </Boton>
          )}
        </form>
      </Hoja>
    </>
  );
}
