"use client";
import { useState } from "react";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Rotulo from "@/components/ui/Rotulo";
import Icono from "@/components/ui/Icono";
import { pedir } from "@/lib/pedir";

// Pedir el link para entrar. Sin contraseña: llega un mail con un boton.
export default function FormIngresar({ volver }: { volver: string }) {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);
  const [linkPrueba, setLinkPrueba] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sitio = new FormData(e.currentTarget).get("sitio");
    setError("");
    setOcupado(true);
    const res = await pedir<{ linkPrueba?: string }>("/api/cuenta/link", "POST", { email, volver, sitio });
    setOcupado(false);
    if (!res.ok) return setError(res.error);
    setLinkPrueba(res.datos.linkPrueba ?? null);
    setEnviado(email.trim().toLowerCase());
  }

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-[440px] flex-col justify-center px-4 py-12">
      {enviado ? (
        <div className="animate-entrada text-center">
          <div className="mx-auto grid size-16 animate-pop place-items-center rounded-full bg-ok/10 text-ok">
            <Icono nombre="mail" tamano={28} />
          </div>
          <h1 className="mt-6 font-titulo text-[30px] leading-[1.1] font-semibold tracking-[-0.02em]">Revisá tu mail</h1>
          <p className="mt-3 text-[15px] text-texto-2">
            Te mandamos un link a <span className="font-medium text-negro">{enviado}</span>. Tocalo desde este dispositivo para entrar. Vence en 15 minutos.
          </p>
          {linkPrueba && (
            <div className="mt-6 rounded-card border border-dashed border-gris-400 p-4 text-left">
              <p className="font-rotulo text-[10px] tracking-[0.08em] text-texto-2 uppercase">Modo prueba (solo en tu compu)</p>
              <a href={linkPrueba} className="mt-2 block text-[14px] break-all text-link">
                Abrir el link del mail
              </a>
            </div>
          )}
          <p className="mt-6 text-[14px] text-texto-2">
            ¿No llegó? Mirá en spam o{" "}
            <button type="button" onClick={() => setEnviado(null)} className="text-link">
              probá con otro mail
            </button>
            .
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} className="animate-entrada" noValidate>
          <Rotulo como="p">Tu cuenta</Rotulo>
          <h1 className="mt-3 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em]">Ingresá con tu mail</h1>
          <p className="mt-3 text-[15px] text-texto-2">Sin contraseña: te mandamos un link y entrás con un toque. Si es la primera vez, se crea tu cuenta.</p>
          <Campo
            etiqueta="Mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vos@mail.com"
            error={error || undefined}
            className="mt-8"
          />
          {/* Campo trampa para robots: las personas no lo ven */}
          <input type="text" name="sitio" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
          <Boton type="submit" ancho className="mt-4" disabled={ocupado || !email.trim()}>
            {ocupado ? "Enviando…" : "Mandame el link"}
          </Boton>
          <p className="mt-5 text-[13px] text-texto-2">
            Al ingresar aceptás los{" "}
            <a href="/terminos" className="text-link">
              términos
            </a>{" "}
            y la{" "}
            <a href="/privacidad" className="text-link">
              política de privacidad
            </a>
            .
          </p>
        </form>
      )}
    </div>
  );
}
