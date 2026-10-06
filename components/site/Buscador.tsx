"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { CampoSelect } from "@/components/ui/Campo";
import Segmentado from "@/components/ui/Segmentado";
import { TIPOS } from "@/lib/etiquetas";
import { OPERACIONES_URL, urlDeBusqueda, type OperacionUrl } from "@/lib/busqueda";

// Buscador de la home: operacion, zona y tipo. Lleva al listado con esos filtros.
export default function Buscador({ zonas }: { zonas: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [buscando, empezar] = useTransition();
  const [operacion, setOperacion] = useState<OperacionUrl>("temporario");
  const [zona, setZona] = useState("");
  const [tipo, setTipo] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        empezar(() => router.push(urlDeBusqueda({ operacion, zona, tipo })));
      }}
      className="vidrio-hoja w-full max-w-[560px] rounded-hoja p-4 shadow-flotante md:p-5"
    >
      <Segmentado etiqueta="Operación" ancho opciones={OPERACIONES_URL.map((o) => ({ valor: o.url, etiqueta: o.etiqueta }))} valor={operacion} onChange={setOperacion} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <CampoSelect etiqueta="Zona" value={zona} onChange={(e) => setZona(e.target.value)}>
          <option value="">Todas</option>
          {zonas.map((z) => (
            <option key={z.slug} value={z.slug}>
              {z.name}
            </option>
          ))}
        </CampoSelect>
        <CampoSelect etiqueta="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos</option>
          {TIPOS.map((t) => (
            <option key={t.valor} value={t.valor.toLowerCase()}>
              {t.etiqueta}
            </option>
          ))}
        </CampoSelect>
      </div>
      <Boton type="submit" ancho disabled={buscando} className="mt-4">
        {buscando ? "Buscando…" : "Buscar"}
      </Boton>
    </form>
  );
}
