"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Boton from "@/components/ui/Boton";
import { Campo } from "@/components/ui/Campo";
import Rotulo from "@/components/ui/Rotulo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    setError("");
    setEnviando(true);
    const res = await signIn("credentials", {
      email: String(datos.get("email") || ""),
      password: String(datos.get("password") || ""),
      redirect: false,
    });
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    setEnviando(false);
    setError("Mail o contraseña incorrectos.");
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[400px] flex-col justify-center px-4 py-10">
      <Rotulo como="p">AlquiloPinamar · Admin</Rotulo>
      <h1 className="mt-3 font-titulo text-[34px] leading-[1.08] font-semibold tracking-[-0.02em]">Ingresar</h1>
      <form onSubmit={entrar} className="mt-8 flex flex-col gap-3.5">
        <Campo etiqueta="Mail" name="email" type="email" autoComplete="username" required />
        <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="current-password" required />
        {error && (
          <p role="alert" className="text-[13px] text-error">
            {error}
          </p>
        )}
        <Boton type="submit" tamano="grande" ancho disabled={enviando} className="mt-2">
          {enviando ? "Ingresando…" : "Ingresar"}
        </Boton>
      </form>
    </main>
  );
}
