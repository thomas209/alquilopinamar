import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Sans, DM_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SE_INDEXA, SITE_DESCRIPCION, SITE_NOMBRE, SITE_URL } from "@/lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NOMBRE, template: "%s | " + SITE_NOMBRE },
  description: SITE_DESCRIPCION,
  applicationName: SITE_NOMBRE,
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: { type: "website", siteName: SITE_NOMBRE, locale: "es_AR", url: "/", title: SITE_NOMBRE, description: SITE_DESCRIPCION },
  twitter: { card: "summary_large_image" },
  // Fuera de produccion (local, previews de Vercel) nada se indexa
  ...(SE_INDEXA ? {} : { robots: { index: false, follow: false } }),
};

export const viewport: Viewport = { themeColor: "#FFFFFF" };

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
