import type { Metadata } from "next";

// Todo /admin queda fuera de los buscadores.
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin AlquiloPinamar" },
  robots: { index: false, follow: false },
};

export default function AdminRaizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
