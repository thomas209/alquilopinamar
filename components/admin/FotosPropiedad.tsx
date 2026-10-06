"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import Icono from "@/components/ui/Icono";
import { pedir } from "@/lib/pedir";
import { MAX_FOTOS, MAX_PESO_MB, miniatura } from "@/lib/foto";

export type FotoAdmin = { id: string; url: string };

type Firma = { url: string; campos: Record<string, string | number> };
type Subida = { public_id: string; secure_url: string; version: number; signature: string; width: number; height: number };

// Fotos de una propiedad en el admin: subir varias, ordenar, elegir portada y borrar.
// Cada foto va directo del navegador a Cloudinary, en su calidad original.
export default function FotosPropiedad({ propiedadId, iniciales, minimo }: { propiedadId: string; iniciales: FotoAdmin[]; minimo: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<FotoAdmin[]>(iniciales);
  const [subiendo, setSubiendo] = useState<{ hechas: number; total: number } | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [porBorrar, setPorBorrar] = useState<string | null>(null);
  const [arrastrada, setArrastrada] = useState<string | null>(null);

  const base = "/api/admin/propiedades/" + propiedadId + "/fotos";
  const bloqueado = ocupado || subiendo !== null;

  async function subirUna(archivo: File): Promise<FotoAdmin | string> {
    const firma = await pedir<Firma>(base + "/firma", "POST");
    if (!firma.ok) return firma.error;

    const form = new FormData();
    form.append("file", archivo);
    for (const [k, valor] of Object.entries(firma.datos.campos)) form.append(k, String(valor));

    let subida: Subida;
    try {
      const res = await fetch(firma.datos.url, { method: "POST", body: form });
      const datos = await res.json();
      if (!res.ok) return "No se pudo subir “" + archivo.name + "”.";
      subida = datos as Subida;
    } catch {
      return "Se cortó la conexión subiendo “" + archivo.name + "”.";
    }

    const guardada = await pedir<FotoAdmin>(base, "POST", {
      publicId: subida.public_id,
      url: subida.secure_url,
      version: subida.version,
      signature: subida.signature,
      width: subida.width,
      height: subida.height,
    });
    return guardada.ok ? guardada.datos : guardada.error;
  }

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const elegidos = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!elegidos.length) return;
    setError("");

    const errores: string[] = [];
    const lugar = MAX_FOTOS - fotos.length;
    const validos = elegidos.filter((a) => {
      if (!a.type.startsWith("image/")) return errores.push("“" + a.name + "” no es una imagen."), false;
      if (a.size > MAX_PESO_MB * 1024 * 1024) return errores.push("“" + a.name + "” pesa más de " + MAX_PESO_MB + " MB."), false;
      return true;
    });
    if (validos.length > lugar) errores.push("El máximo es " + MAX_FOTOS + " fotos por propiedad.");
    const aSubir = validos.slice(0, Math.max(0, lugar));

    setSubiendo({ hechas: 0, total: aSubir.length });
    for (let i = 0; i < aSubir.length; i++) {
      const r = await subirUna(aSubir[i]);
      if (typeof r === "string") errores.push(r);
      else setFotos((f) => [...f, r]);
      setSubiendo({ hechas: i + 1, total: aSubir.length });
    }
    setSubiendo(null);
    if (errores.length) setError(errores.join(" "));
    router.refresh(); // actualiza "qué falta para publicar"
  }

  async function guardarOrden(nuevo: FotoAdmin[]) {
    const anterior = fotos;
    setFotos(nuevo);
    setError("");
    setOcupado(true);
    const res = await pedir(base, "PATCH", { orden: nuevo.map((f) => f.id) });
    setOcupado(false);
    if (!res.ok) {
      setFotos(anterior);
      setError(res.error);
    }
  }

  function mover(desde: number, hasta: number) {
    if (bloqueado || desde === hasta || hasta < 0 || hasta >= fotos.length) return;
    const nuevo = [...fotos];
    const [f] = nuevo.splice(desde, 1);
    nuevo.splice(hasta, 0, f);
    guardarOrden(nuevo);
  }

  async function borrar(id: string) {
    if (porBorrar !== id) return setPorBorrar(id);
    setPorBorrar(null);
    setError("");
    setOcupado(true);
    const res = await pedir(base + "/" + id, "DELETE");
    setOcupado(false);
    if (!res.ok) return setError(res.error);
    setFotos((f) => f.filter((x) => x.id !== id));
    router.refresh();
  }

  const circulo = "flex size-9 items-center justify-center rounded-full bg-blanco/85 text-negro backdrop-blur-md transition-opacity duration-200 disabled:opacity-40";

  return (
    <div>
      <p className="max-w-[60ch] text-[14px] text-texto-2">
        {fotos.length === 0 ? "Todavía no hay fotos." : fotos.length + (fotos.length === 1 ? " foto." : " fotos.")} Mínimo {minimo} para publicar. La primera es la
        portada. Se suben en calidad original (hasta {MAX_PESO_MB} MB cada una).
      </p>

      {fotos.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
          {fotos.map((f, i) => (
            <li
              key={f.id}
              draggable={!bloqueado}
              onDragStart={() => setArrastrada(f.id)}
              onDragEnd={() => setArrastrada(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const desde = fotos.findIndex((x) => x.id === arrastrada);
                setArrastrada(null);
                if (desde >= 0) mover(desde, i);
              }}
              className={"relative overflow-hidden rounded-[14px] bg-gris-100 " + (arrastrada === f.id ? "opacity-40" : "")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={miniatura(f.url)} alt={"Foto " + (i + 1)} loading="lazy" draggable={false} className="aspect-[4/3] w-full object-cover" />

              {i === 0 && (
                <span className="absolute top-2 left-2 rounded-full bg-negro px-2.5 py-1 font-rotulo text-[10px] tracking-[0.08em] text-blanco uppercase">Portada</span>
              )}

              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button type="button" aria-label="Mover antes" disabled={bloqueado || i === 0} onClick={() => mover(i, i - 1)} className={circulo}>
                    <Icono nombre="flecha-izq" tamano={18} />
                  </button>
                  <button type="button" aria-label="Mover después" disabled={bloqueado || i === fotos.length - 1} onClick={() => mover(i, i + 1)} className={circulo}>
                    <Icono nombre="flecha-der" tamano={18} />
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Borrar foto"
                  disabled={bloqueado}
                  onClick={() => borrar(f.id)}
                  onBlur={() => setPorBorrar(null)}
                  className={porBorrar === f.id ? "h-9 rounded-full bg-error px-3 text-[12px] font-medium text-blanco" : circulo}
                >
                  {porBorrar === f.id ? "¿Borrar?" : <Icono nombre="cerrar" tamano={18} />}
                </button>
              </div>

              {i !== 0 && (
                <button
                  type="button"
                  disabled={bloqueado}
                  onClick={() => mover(i, 0)}
                  className="absolute top-2 left-2 rounded-full bg-blanco/85 px-2.5 py-1 font-rotulo text-[10px] tracking-[0.08em] text-negro uppercase backdrop-blur-md disabled:opacity-40"
                >
                  Hacer portada
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <input ref={input} type="file" accept="image/*" multiple hidden onChange={alElegir} />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Boton variante="secundario" tamano="chico" disabled={bloqueado || fotos.length >= MAX_FOTOS} onClick={() => input.current?.click()}>
          {subiendo ? "Subiendo " + Math.min(subiendo.hechas + 1, subiendo.total) + " de " + subiendo.total + "…" : "Subir fotos"}
        </Boton>
        {fotos.length > 1 && <span className="text-[13px] text-texto-2">Arrastrá o usá las flechas para ordenar.</span>}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
