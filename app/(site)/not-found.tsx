import type { Metadata } from "next";
import NoEncontrada from "@/components/site/NoEncontrada";

// 404 de una propiedad o zona que no existe (va con el header y el footer del sitio).
export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return <NoEncontrada />;
}
