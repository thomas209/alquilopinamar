"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";

export default function ConfirmarIngreso({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState(token ? "" : "El link está incompleto. Pedí uno nuevo.");
  const [ocupado, setOcupado] = useState(false);

  async function entrar() {
    setOcupado(true);
    setError("");
    const res = await pedir<{ volver: string }>("/api/cuenta/ingresar", "POST", { token });
    if (!res.ok) {
      setOcupado(false);
      return setError(res.error);
    }
    router.replace(res.datos.volver);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-[440px] animate-entrada flex-col justify-center px-4 py-12 text-center">
      <Rotulo como="p">Tu cuenta</Rotulo>
      <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em]">{error ? "No pudimos entrar" : "Ya casi"}</h1>
      <p className="mt-3 text-[15px] text-texto-2">{error || "Tocá el botón para entrar a tu cuenta en este dispositivo."}</p>
      <div className="mt-8">
        {error ? (
          <Boton href="/ingresar" ancho>
            Pedir otro link
          </Boton>
        ) : (
          <Boton ancho onClick={entrar} disabled={ocupado}>
            {ocupado ? "Entrando…" : "Entrar"}
          </Boton>
        )}
      </div>
    </div>
  );
}
