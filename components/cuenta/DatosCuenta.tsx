"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Icono from "@/components/ui/Icono";
import { pedir } from "@/lib/pedir";

type Datos = { firstName: string; lastName: string; phone: string };

export default function DatosCuenta({ inicial }: { inicial: Datos }) {
  const router = useRouter();
  const [d, setD] = useState(inicial);
  const [guardado, setGuardado] = useState(inicial);
  const [estado, setEstado] = useState<"" | "guardando" | "listo">("");
  const [error, setError] = useState("");
  const cambio = JSON.stringify(d) !== JSON.stringify(guardado);
  const set = (k: keyof Datos) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEstado("");
    setD({ ...d, [k]: e.target.value });
  };

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEstado("guardando");
    const res = await pedir<{ firstName: string; lastName: string; phone: string | null }>("/api/cuenta", "PATCH", d);
    if (!res.ok) {
      setEstado("");
      return setError(res.error);
    }
    const nuevo = { ...res.datos, phone: res.datos.phone ?? "" };
    setD(nuevo);
    setGuardado(nuevo);
    setEstado("listo");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} className="mt-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Nombre" autoComplete="given-name" value={d.firstName} onChange={set("firstName")} maxLength={60} />
        <Campo etiqueta="Apellido" autoComplete="family-name" value={d.lastName} onChange={set("lastName")} maxLength={60} />
        <Campo etiqueta="Teléfono / WhatsApp" type="tel" inputMode="tel" autoComplete="tel" value={d.phone} onChange={set("phone")} maxLength={40} placeholder="+54 9 2254 …" className="sm:col-span-2" error={error || undefined} />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <Boton type="submit" disabled={!cambio || estado === "guardando"}>
          {estado === "guardando" ? "Guardando…" : "Guardar"}
        </Boton>
        {estado === "listo" && !cambio && (
          <span role="status" className="flex items-center gap-1.5 text-[14px] text-ok">
            <Icono nombre="check" tamano={16} />
            Guardado
          </span>
        )}
      </div>
    </form>
  );
}

export function CerrarSesion() {
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  return (
    <Boton
      variante="secundario"
      disabled={ocupado}
      onClick={async () => {
        setOcupado(true);
        await pedir("/api/cuenta/salir", "POST");
        router.replace("/");
        router.refresh();
      }}
    >
      {ocupado ? "Cerrando…" : "Cerrar sesión"}
    </Boton>
  );
}
