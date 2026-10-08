import Link from "next/link";
import { cn } from "@/lib/cn";

type Variante = "primario" | "secundario" | "texto";
type Tamano = "chico" | "normal" | "grande";

type Base = {
  variante?: Variante;
  tamano?: Tamano;
  ancho?: boolean; // ocupa todo el ancho
  className?: string;
  children: React.ReactNode;
};

type ComoBoton = Base & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };
type ComoLink = Base & { href: string; target?: string; rel?: string; "aria-label"?: string; onClick?: React.MouseEventHandler<HTMLAnchorElement> };

const TAMANOS: Record<Tamano, string> = {
  chico: "h-11 px-5 text-[14px]",
  normal: "h-[52px] px-6 text-[16px]",
  grande: "h-[54px] px-7 text-[17px]",
};

const VARIANTES: Record<Variante, string> = {
  primario: "bg-negro text-blanco hover:opacity-90",
  secundario: "bg-gris-100 text-negro hover:bg-gris-200",
  texto: "text-link hover:opacity-70",
};

// Boton del sitio: siempre pastilla. Con "href" se comporta como link.
export default function Boton(props: ComoBoton | ComoLink) {
  const { variante = "primario", tamano = "normal", ancho = false, className, children, ...resto } = props;

  const clases = cn(
    "inline-flex items-center justify-center gap-2 rounded-pastilla font-medium whitespace-nowrap select-none",
    "transition-[transform,opacity,background-color] duration-200 ease-app active:scale-[0.97]",
    "disabled:pointer-events-none disabled:opacity-45",
    variante === "texto" ? "h-auto px-1 py-1 text-[14px]" : TAMANOS[tamano],
    VARIANTES[variante],
    ancho && "w-full",
    className,
  );

  if (resto.href !== undefined) {
    const { href, ...link } = resto;
    return (
      <Link href={href} className={clases} {...link}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...boton } = resto;
  return (
    <button type={type} className={clases} {...boton}>
      {children}
    </button>
  );
}
