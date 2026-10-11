"use client";
import Link from "next/link";
import Icono from "@/components/ui/Icono";
import { useUsuario } from "@/store/usuario";

// Acceso a la cuenta en el header: silueta si no entro, inicial si ya entro.
export default function BotonCuenta() {
  const usuario = useUsuario();
  const inicial = (usuario?.firstName || usuario?.email || "").trim().charAt(0).toUpperCase();

  return (
    <Link
      href={usuario ? "/cuenta" : "/cuenta/ingresar"}
      prefetch={false}
      aria-label={usuario ? "Tu cuenta" : "Ingresar"}
      className="grid size-10 place-items-center rounded-full transition-[opacity,transform] duration-200 ease-app hover:opacity-70 active:scale-[0.97]"
    >
      {usuario ? (
        <span className="grid size-8 place-items-center rounded-full bg-negro font-titulo text-[14px] font-semibold text-blanco">{inicial}</span>
      ) : (
        <Icono nombre="usuario" tamano={22} grosor={1.6} />
      )}
    </Link>
  );
}
