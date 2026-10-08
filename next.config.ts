import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// IPs de esta compu en la red de la casa: permiten abrir el sitio en
// desarrollo desde el celular (http://IP:3000). Solo afecta a "npm run dev".
const ipsLocales = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

// Cabeceras de seguridad para todas las respuestas.
// (Falta una Content-Security-Policy: se suma despues de publicar, probandola en produccion.)
const SEGURIDAD = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=()" },
];

// Ojo: aca NO van ignoreBuildErrors ni ignoreDuringBuilds.
// Si hay errores de tipos, el build tiene que fallar.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  allowedDevOrigins: ipsLocales,
  async headers() {
    return [{ source: "/:path*", headers: SEGURIDAD }];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
