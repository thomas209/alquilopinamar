import type { Metadata } from "next";
import Footer from "@/components/site/Footer";
import Header from "@/components/site/Header";
import NoEncontrada from "@/components/site/NoEncontrada";

// 404 de cualquier direccion que no existe en el sitio.
export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <NoEncontrada />
      </main>
      <Footer />
    </>
  );
}
