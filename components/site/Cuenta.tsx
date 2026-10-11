"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import { pedir } from "@/lib/pedir";
import { renovarSesion, type Usuario } from "@/store/usuario";

type Errores = Partial<Record<"firstName" | "phone" | "whatsapp", string>>;

// Datos de la cuenta: nombre, apellido, telefono y WhatsApp.
export function DatosCuenta({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (guardando) return;
    const f = new FormData(e.currentTarget);
    const datos = {
      firstName: String(f.get("firstName") ?? "").trim(),
      lastName: String(f.get("lastName") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      whatsapp: String(f.get("whatsapp") ?? "").trim(),
    };
    if (datos.firstName.length < 2) {
      setErrores({ firstName: "Poné tu nombre." });
      return;
    }
    setErrores({});
    setErrorGeneral("");
    setGuardado(false);
    setGuardando(true);
    const r = await pedir<{ user: Usuario }>("/api/panel/cuenta", "PATCH", datos);
    setGuardando(false);
    if (!r.ok) {
      setErrorGeneral(r.error);
      return;
    }
    renovarSesion(r.datos.user);
    setGuardado(true);
    router.refresh();
  }

  return (
    <form onSubmit={guardar} onChange={() => setGuardado(false)} noValidate className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Campo etiqueta="Nombre" name="firstName" autoComplete="given-name" defaultValue={usuario.firstName} required maxLength={60} error={errores.firstName} />
        <Campo etiqueta="Apellido" name="lastName" autoComplete="family-name" defaultValue={usuario.lastName} maxLength={60} />
        <Campo etiqueta="Teléfono (opcional)" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={usuario.phone ?? ""} maxLength={30} error={errores.phone} />
        <Campo
          etiqueta="WhatsApp (opcional)"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          defaultValue={usuario.whatsapp ?? ""}
          maxLength={30}
          ayuda="Con código de área. Ej: 2254 123456"
          error={errores.whatsapp}
        />
      </div>
      <Campo etiqueta="Mail" value={usuario.email} readOnly disabled ayuda="Es con el que entrás. No se puede cambiar." />
      {errorGeneral && (
        <p role="alert" className="text-[14px] text-error">
          {errorGeneral}
        </p>
      )}
      <div className="flex items-center gap-4">
        <Boton type="submit" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Boton>
        {guardado && (
          <p role="status" className="text-[14px] text-ok">
            Guardado
          </p>
        )}
      </div>
    </form>
  );
}

// Cierra la sesion y vuelve al inicio.
export function BotonSalir() {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await pedir("/api/auth/usuario/salir", "POST");
    renovarSesion(null);
    router.replace("/");
    router.refresh();
  }

  return (
    <Boton variante="secundario" onClick={salir} disabled={saliendo}>
      {saliendo ? "Saliendo…" : "Cerrar sesión"}
    </Boton>
  );
}
