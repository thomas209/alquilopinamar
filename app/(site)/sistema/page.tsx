import type { Metadata } from "next";
import Demo from "./Demo";

// Muestrario del design system. Es una pagina interna para revisar los
// componentes base en el celular y en la compu; no se indexa en buscadores.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

export default function SistemaPage() {
  return <Demo />;
}
