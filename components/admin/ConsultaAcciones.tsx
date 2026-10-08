"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { CampoArea } from "@/components/ui/Campo";
import Icono from "@/components/ui/Icono";
import Rotulo from "@/components/ui/Rotulo";
import Segmentado from "@/components/ui/Segmentado";
import { ESTADOS_CONSULTA, type EstadoConsulta } from "@/lib/etiquetas";
import { pedir } from "@/lib/pedir";

// Panel lateral del detalle de una consulta: responder, cambiar estado y notas internas.
export default function ConsultaAcciones({ id, estado: inicial, notas: notasIniciales, mailto, whatsapp }: { id: string; estado: EstadoConsulta; notas: string; mailto: string; whatsapp: string | null }) {
  const router = useRouter();
  const [estado, setEstado] = useState(inicial);
  const [notas, setNotas] = useState(notasIniciales);
  const [notasGuardadas, setNotasGuardadas] = useState(notasIniciales);
  const [error, setError] = useState("");
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [, empezar] = useTransition();

  async function cambiarEstado(nuevo: EstadoConsulta) {
    if (nuevo === estado) return;
    const anterior = estado;
    setEstado(nuevo); // se ve al instante; si falla se vuelve atras
    setError("");
    const r = await pedir("/api/admin/consultas/" + id, "PATCH", { status: nuevo });
    if (!r.ok) {
      setEstado(anterior);
      setError(r.error);
      return;
    }
    empezar(() => router.refresh());
  }

  // Al responder, una consulta nueva pasa sola a "Respondida"
  const alResponder = () => {
    if (estado === "NUEVA") cambiarEstado("RESPONDIDA");
  };

  async function guardarNotas() {
    setGuardandoNotas(true);
    setError("");
    const r = await pedir("/api/admin/consultas/" + id, "PATCH", { adminNotes: notas });
    setGuardandoNotas(false);
    if (!r.ok) return setError(r.error);
    setNotasGuardadas(notas);
  }

  return (
    <div className="space-y-8 md:sticky md:top-24">
      <section>
        <Rotulo como="p">Responder</Rotulo>
        <div className="mt-3 flex flex-col gap-3">
          <Boton href={mailto} ancho onClick={alResponder}>
            <Icono nombre="mail" tamano={18} />
            Responder por mail
          </Boton>
          {whatsapp && (
            <Boton href={whatsapp} target="_blank" rel="noopener noreferrer" variante="secundario" ancho onClick={alResponder}>
              <Icono nombre="chat" tamano={18} />
              Responder por WhatsApp
            </Boton>
          )}
        </div>
      </section>

      <section>
        <Rotulo como="p">Estado</Rotulo>
        <Segmentado
          etiqueta="Estado de la consulta"
          ancho
          className="mt-3"
          opciones={ESTADOS_CONSULTA.map((e) => ({ valor: e.valor as EstadoConsulta, etiqueta: e.etiqueta as string }))}
          valor={estado}
          onChange={cambiarEstado}
        />
      </section>

      <section>
        <CampoArea etiqueta="Notas internas" rows={4} value={notas} onChange={(e) => setNotas(e.target.value)} maxLength={5000} placeholder="Solo las ve el admin. Ej: le pasé precio por 2da quincena de enero." />
        {notas !== notasGuardadas && (
          <Boton variante="secundario" tamano="chico" className="mt-3" onClick={guardarNotas} disabled={guardandoNotas}>
            {guardandoNotas ? "Guardando…" : "Guardar notas"}
          </Boton>
        )}
      </section>

      {error && (
        <p role="alert" className="text-[14px] text-error">
          {error}
        </p>
      )}
    </div>
  );
}
