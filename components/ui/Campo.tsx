"use client";
import { useId } from "react";
import { cn } from "@/lib/cn";

// Estilo comun de todos los campos: fondo gris que pasa a blanco con borde negro al enfocar.
// Texto de 16px para que el iPhone no haga zoom.
const CAJA =
  "w-full rounded-campo border border-transparent bg-gris-50 px-4 text-[16px] text-negro outline-none " +
  "transition-[background-color,border-color] duration-200 ease-app placeholder:text-gris-400 " +
  "focus:border-negro focus:bg-blanco disabled:opacity-50";

type Comun = {
  etiqueta?: string;
  error?: string;
  ayuda?: string;
  className?: string; // clases del contenedor
};

function Marco({
  id,
  etiqueta,
  error,
  ayuda,
  className,
  children,
}: Comun & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-[7px] block font-rotulo text-[11px] leading-none tracking-[0.08em] text-texto-2 uppercase">
          {etiqueta}
        </label>
      )}
      {children}
      {error ? (
        <p id={id + "-msj"} className="mt-1.5 text-[13px] text-error">
          {error}
        </p>
      ) : ayuda ? (
        <p id={id + "-msj"} className="mt-1.5 text-[13px] text-texto-2">
          {ayuda}
        </p>
      ) : null}
    </div>
  );
}

// Campo de una linea (texto, mail, telefono, numero, fecha).
export function Campo({
  etiqueta,
  error,
  ayuda,
  className,
  id: idProp,
  ...props
}: Comun & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? id + "-msj" : undefined}
        className={cn(CAJA, "h-[52px]", error && "border-error")}
        {...props}
      />
    </Marco>
  );
}

// Campo de varias lineas (mensaje, descripcion).
export function CampoArea({
  etiqueta,
  error,
  ayuda,
  className,
  id: idProp,
  rows = 4,
  ...props
}: Comun & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "className">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? id + "-msj" : undefined}
        className={cn(CAJA, "resize-y py-3.5 leading-normal", error && "border-error")}
        {...props}
      />
    </Marco>
  );
}

// Desplegable.
export function CampoSelect({
  etiqueta,
  error,
  ayuda,
  className,
  id: idProp,
  children,
  ...props
}: Comun & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <Marco id={id} etiqueta={etiqueta} error={error} ayuda={ayuda} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? id + "-msj" : undefined}
          className={cn(CAJA, "h-[52px] appearance-none pr-11", error && "border-error")}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-texto-2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </Marco>
  );
}
