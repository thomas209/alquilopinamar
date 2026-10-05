import type { Metadata } from "next";
import { Inter, Instrument_Sans, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Tres tipografias con rol fijo (ver docs/05-design-system.md):
// Inter = lectura, formularios, menu.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Instrument Sans = titulos y precios.
const instrument = Instrument_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-instrument",
  display: "swap",
});

// DM Mono = rotulos en mayusculas (zona, tipo, codigo).
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const DESCRIPCION =
  "Alquiler temporario, alquiler anual y venta de propiedades en Pinamar, Cariló, Valeria del Mar, Ostende y Costa Esmeralda.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AlquiloPinamar",
    template: "%s | AlquiloPinamar",
  },
  description: DESCRIPCION,
  openGraph: {
    title: "AlquiloPinamar",
    description: DESCRIPCION,
    url: SITE_URL,
    siteName: "AlquiloPinamar",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${instrument.variable} ${dmMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
