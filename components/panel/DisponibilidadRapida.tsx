"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarioOcupado from "@/components/panel/CalendarioOcupado";
import Boton from "@/components/ui/Boton";
import Hoja from "@/components/ui/Hoja";
import type { Rango } from "@/lib/disponibilidad";
import { pedir } from "@/lib/pedir";

// Funcion para guardar las fechas ocupadas contra la API que corresponda
export function guardarOcupadosEn(url: string) {
  return async (rangos: Rango[]) => {
    const r = await pedir<{ rangos: Rango[] }>(url, "PUT", { rangos });
    return r.ok ? { ok: true as const, rangos: r.datos.rangos } : { ok: false as const, error: r.error };
  };
}

// Desde "Mis propiedades": marcar fechas ocupadas sin entrar al asistente.
export default function DisponibilidadRapida({
  propiedadId,
  titulo,
  ocupados,
  periodos,
}: {
  propiedadId: string;
  titulo: string;
  ocupados: Rango[];
  periodos: { label: string; startDate: string; endDate: string }[];
}) {
  const router = useRouter();
  const [abierta, setAbierta] = useState(false);

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
        <p className="mt-1 mb-6 text-[13px] text-texto-2">Cada cambio se guarda solo y se ve enseguida en la publicación.</p>
        <CalendarioOcupado iniciales={ocupados} periodos={periodos} onGuardar={guardarOcupadosEn("/api/panel/propiedades/" + propiedadId + "/ocupado")} />
      </Hoja>
    </>
  );
}
