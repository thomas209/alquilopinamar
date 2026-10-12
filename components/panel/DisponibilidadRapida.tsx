"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import Hoja from "@/components/ui/Hoja";
import Segmentado from "@/components/ui/Segmentado";
import { disponibleEfectivo, rangoCorto } from "@/lib/disponibilidad";
import { pedir } from "@/lib/pedir";

type Periodo = { id: string; label: string; startDate: string | null; endDate: string | null; isAvailable: boolean };

// Desde "Mis propiedades": marcar alquilado o disponible con un toque.
export default function DisponibilidadRapida({ propiedadId, titulo, periodos: iniciales }: { propiedadId: string; titulo: string; periodos: Periodo[] }) {
  const router = useRouter();
  const [abierta, setAbierta] = useState(false);
  const [periodos, setPeriodos] = useState(iniciales);
  const [guardando, setGuardando] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function cambiar(p: Periodo, isAvailable: boolean) {
    const anterior = periodos;
    setPeriodos((lista) => lista.map((x) => (x.id === p.id ? { ...x, isAvailable } : x)));
    setGuardando(p.id);
    setError("");
    const r = await pedir("/api/panel/propiedades/" + propiedadId + "/disponibilidad", "PATCH", { rateId: p.id, isAvailable });
    setGuardando(null);
    if (!r.ok) {
      setPeriodos(anterior);
      setError(r.error);
    }
  }

  function cerrar() {
    setAbierta(false);
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setAbierta(true)} className="text-[15px] font-medium text-link hover:opacity-70">
        Disponibilidad
      </button>
      <Hoja
        abierta={abierta}
        onCerrar={cerrar}
        titulo="Disponibilidad"
        pie={
          <Boton ancho onClick={cerrar}>
            Listo
          </Boton>
        }
      >
        <p className="truncate text-[15px] text-texto-2">{titulo}</p>
        <p className="mt-1 text-[13px] text-texto-2">Cada cambio se guarda solo y se ve enseguida en la publicación.</p>
        {error && (
          <p role="alert" className="mt-4 text-[14px] text-error">
            {error}
          </p>
        )}
        <ul className="mt-5 divide-y divide-gris-200">
          {periodos.map((p) => {
            const pisado = p.isAvailable && !disponibleEfectivo(p, periodos);
            return (
              <li key={p.id} className="flex flex-col gap-3 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[16px] font-medium">{p.label}</p>
                  {p.startDate && p.endDate && <p className="shrink-0 text-[13px] text-texto-2 tabular-nums">{rangoCorto(p.startDate, p.endDate)}</p>}
                </div>
                <Segmentado
                  etiqueta={"Estado de " + p.label}
                  valor={p.isAvailable ? "si" : "no"}
                  onChange={(x) => cambiar(p, x === "si")}
                  ancho
                  opciones={[
                    { valor: "si", etiqueta: guardando === p.id ? "Guardando…" : "Disponible" },
                    { valor: "no", etiqueta: "Alquilado" },
                  ]}
                />
                {pisado && <p className="text-[13px] text-texto-2">Se muestra como no disponible porque se pisa con un período alquilado.</p>}
              </li>
            );
          })}
        </ul>
      </Hoja>
    </>
  );
}
