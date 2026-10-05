// Unico set de iconos del sitio: trazo de 1.8, caja de 24, puntas redondeadas.
// Para sumar uno nuevo, agregarlo aca con el mismo estilo (no mezclar otros sets).
const ICONOS = {
  corazon: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  cerrar: <path d="M18 6 6 18M6 6l12 12" />,
  buscar: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  filtros: <path d="M4 7h16M7 12h10M10 17h4" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  "flecha-izq": <path d="m15 18-6-6 6-6" />,
  "flecha-der": <path d="m9 18 6-6-6-6" />,
  "flecha-abajo": <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  pin: (
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  usuario: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  personas: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  compartir: <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />,
  calendario: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  cama: <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />,
} as const;

export type NombreIcono = keyof typeof ICONOS;

export default function Icono({
  nombre,
  tamano = 20,
  className,
}: {
  nombre: NombreIcono;
  tamano?: number;
  className?: string;
}) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {ICONOS[nombre]}
    </svg>
  );
}
