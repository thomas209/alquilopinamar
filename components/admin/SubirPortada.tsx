"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";
import { fotoUrl, MAX_PESO_MB } from "@/lib/foto";

type Firma = { url: string; campos: Record<string, string | number> };
type Subida = { public_id: string; secure_url: string; version: number; signature: string };

// Foto de portada (home o zona): subir, cambiar y quitar.
// Va directo del navegador a Cloudinary en calidad original; el servidor valida la firma.
export default function SubirPortada({
  destino,
  titulo,
  url,
  respaldo,
  enlace,
  textoRespaldo,
}: {
  destino: string; // "home" o "zona:<slug>"
  titulo: string;
  url: string | null; // portada cargada
  respaldo: string | null; // la que se ve si no hay portada cargada
  enlace: string; // pagina publica donde se ve
  textoRespaldo: string; // de donde sale la automatica
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [actual, setActual] = useState(url);
  const [estado, setEstado] = useState<"" | "subiendo" | "quitando">("");
  const [confirmar, setConfirmar] = useState(false);
  const [error, setError] = useState("");

  const vista = actual ?? respaldo;

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setError("");
    setConfirmar(false);
    if (!archivo.type.startsWith("image/")) return setError("El archivo no es una imagen.");
    if (archivo.size > MAX_PESO_MB * 1024 * 1024) return setError("La foto pesa más de " + MAX_PESO_MB + " MB.");

    setEstado("subiendo");
    const firma = await pedir<Firma>("/api/admin/portadas/firma", "POST", { destino });
    if (!firma.ok) {
      setEstado("");
      return setError(firma.error);
    }

    const form = new FormData();
    form.append("file", archivo);
    for (const [k, v] of Object.entries(firma.datos.campos)) form.append(k, String(v));

    let subida: Subida;
    try {
      const res = await fetch(firma.datos.url, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      subida = (await res.json()) as Subida;
    } catch {
      setEstado("");
      return setError("No se pudo subir la foto. Probá de nuevo.");
    }

    const guardada = await pedir<{ url: string }>("/api/admin/portadas", "PUT", {
      destino,
      publicId: subida.public_id,
      url: subida.secure_url,
      version: subida.version,
      signature: subida.signature,
    });
    setEstado("");
    if (!guardada.ok) return setError(guardada.error);
    setActual(guardada.datos.url);
    router.refresh();
  }

  async function quitar() {
    if (!confirmar) return setConfirmar(true);
    setConfirmar(false);
    setError("");
    setEstado("quitando");
    const res = await pedir("/api/admin/portadas", "DELETE", { destino });
    setEstado("");
    if (!res.ok) return setError(res.error);
    setActual(null);
    router.refresh();
  }

  const ocupado = estado !== "";

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-gris-100">
        {vista && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fotoUrl(vista, "c_fill,g_auto,w_960,h_540,q_auto,f_auto")}
            alt={"Portada de " + titulo}
            className={"h-full w-full object-cover transition-opacity duration-300 " + (ocupado ? "opacity-50" : "")}
          />
        )}
        <span className="absolute top-3 left-3 rounded-pastilla bg-blanco/85 px-3 py-1.5 backdrop-blur-md">
          <Rotulo como="span">{actual ? "Portada cargada" : vista ? "Automática" : "Sin foto"}</Rotulo>
        </span>
        {ocupado && (
          <span className="absolute inset-0 grid place-items-center text-[14px] font-medium">
            {estado === "subiendo" ? "Subiendo…" : "Quitando…"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-titulo text-[17px] font-semibold tracking-[-0.02em]">{titulo}</h3>
          <p className="mt-0.5 text-[13px] text-texto-2">
            {actual ? "Foto elegida por vos." : textoRespaldo}{" "}
            <a href={enlace} target="_blank" rel="noreferrer" className="text-link">
              Ver
            </a>
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Boton tamano="chico" disabled={ocupado} onClick={() => input.current?.click()}>
          {actual ? "Cambiar foto" : "Subir foto"}
        </Boton>
        {actual && (
          <Boton tamano="chico" variante="secundario" disabled={ocupado} onClick={quitar} onBlur={() => setConfirmar(false)}>
            {confirmar ? "¿Seguro? Quitar" : "Quitar"}
          </Boton>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-error">
          {error}
        </p>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={alElegir} />
    </div>
  );
}
