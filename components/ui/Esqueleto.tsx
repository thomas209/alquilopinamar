import { cn } from "@/lib/cn";

// Bloque gris que late mientras carga el contenido real. Darle el tamano con className.
export default function Esqueleto({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-campo bg-gris-100", className)} />;
}
