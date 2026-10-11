"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Icono from "@/components/ui/Icono";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";
import { renovarSesion } from "@/store/usuario";

const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Columna angosta y centrada de las pantallas de ingreso.
function Marco({ rotulo, titulo, bajada, children }: { rotulo: string; titulo: string; bajada?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mx-auto flex min-h-[calc(100svh-180px)] max-w-[440px] flex-col justify-center px-4 py-12 md:py-20">
      <Rotulo como="p">{rotulo}</Rotulo>
      <h1 className="mt-4 font-titulo text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[36px]">{titulo}</h1>
      {bajada && <div className="mt-3 text-[16px] leading-relaxed text-texto-2">{bajada}</div>}
      <div className="mt-8 animate-entrada">{children}</div>
    </section>
  );
}

// /cuenta/ingresar: pide el mail y manda el link magico.
export function PedirLink({ volver, error }: { volver: string; error: string | null }) {
  const [email, setEmail] = useState("");
  const [errorCampo, setErrorCampo] = useState("");
  const [errorGeneral, setErrorGeneral] = useState(error ?? "");
  const [enviando, setEnviando] = useState(false);
  const [enviadoA, setEnviadoA] = useState<string | null>(null);
  const trampa = useRef<HTMLInputElement>(null);

  async function enviar(e?: React.FormEvent) {
    e?.preventDefault();
    if (enviando) return;
    const mail = email.trim().toLowerCase();
    if (!MAIL.test(mail)) {
      setErrorCampo("Revisá el mail.");
      return;
    }
    setErrorCampo("");
    setErrorGeneral("");
    setEnviando(true);
    const r = await pedir("/api/auth/usuario/pedir-link", "POST", { email: mail, volver, sitio: trampa.current?.value ?? "" });
    setEnviando(false);
    if (!r.ok) {
      setErrorGeneral(r.error);
      return;
    }
    setEnviadoA(mail);
  }

  if (enviadoA) {
    return (
      <Marco rotulo="Tu cuenta" titulo="Revisá tu mail">
        <div className="flex flex-col items-start gap-4">
          <span className="grid size-12 place-items-center rounded-full bg-ok/10 text-ok">
            <Icono nombre="check" tamano={22} />
          </span>
          <p className="text-[16px] leading-relaxed">
            Te mandamos un link a <strong className="font-medium break-all">{enviadoA}</strong>. Abrilo en este dispositivo para entrar acá. Vence en 15 minutos.
          </p>
          <p className="text-[14px] text-texto-2">¿No llegó? Fijate en spam o promociones. Puede tardar un minuto.</p>
          {errorGeneral && (
            <p role="alert" className="text-[14px] text-error">
              {errorGeneral}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            <Boton variante="texto" onClick={() => enviar()} disabled={enviando}>
              {enviando ? "Mandando…" : "Mandarlo de nuevo"}
            </Boton>
            <Boton variante="texto" onClick={() => setEnviadoA(null)}>
              Usar otro mail
            </Boton>
          </div>
        </div>
      </Marco>
    );
  }

  return (
    <Marco rotulo="Tu cuenta" titulo="Entrá a AlquiloPinamar" bajada="Te mandamos un link a tu mail para entrar. Sin contraseñas. Si es la primera vez, la cuenta se crea sola.">
      <form onSubmit={enviar} noValidate className="space-y-5">
        <Campo
          etiqueta="Mail"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          required
          maxLength={120}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errorCampo}
        />
        {/* Campo trampa para robots: invisible para las personas */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Sitio web
            <input ref={trampa} type="text" name="sitio" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        {errorGeneral && (
          <p role="alert" className="text-[14px] text-error">
            {errorGeneral}
          </p>
        )}
        <Boton type="submit" ancho disabled={enviando}>
          {enviando ? "Mandando…" : "Mandarme el link"}
        </Boton>
        <p className="text-center text-[12px] leading-relaxed text-texto-2">
          Al entrar aceptás los{" "}
          <Link href="/terminos" className="underline underline-offset-2">
            términos
          </Link>{" "}
          y la{" "}
          <Link href="/privacidad" className="underline underline-offset-2">
            política de privacidad
          </Link>
          .
        </p>
      </form>
    </Marco>
  );
}

// /cuenta/entrar?token=…: un boton confirma el ingreso. El link del mail no
// entra solo, asi los antivirus que abren los links no lo gastan.
export function UsarLink({ token }: { token: string }) {
  const router = useRouter();
  const [entrando, setEntrando] = useState(false);
  const [error, setError] = useState(token ? "" : "Al link le falta una parte. Copialo completo desde el mail, o pedí uno nuevo.");

  async function entrar() {
    if (entrando || !token) return;
    setEntrando(true);
    setError("");
    const r = await pedir<{ volver: string }>("/api/auth/usuario/entrar", "POST", { token });
    if (!r.ok) {
      setEntrando(false);
      setError(r.error);
      return;
    }
    renovarSesion();
    router.replace(r.datos.volver);
    router.refresh();
  }

  return (
    <Marco rotulo="Tu cuenta" titulo={error ? "No pudimos entrar" : "Entrá a tu cuenta"} bajada={error ? undefined : "Tocá el botón para terminar de entrar."}>
      {error ? (
        <div className="space-y-6">
          <p role="alert" className="text-[16px] leading-relaxed">
            {error}
          </p>
          <Boton href="/cuenta/ingresar" ancho>
            Pedir un link nuevo
          </Boton>
        </div>
      ) : (
        <Boton ancho onClick={entrar} disabled={entrando} autoFocus>
          {entrando ? "Entrando…" : "Entrar"}
        </Boton>
      )}
    </Marco>
  );
}

