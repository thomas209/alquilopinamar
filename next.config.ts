import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

// IPs de esta compu en la red de la casa: permiten abrir el sitio en
// desarrollo desde el celular (http://IP:3000). Solo afecta a "npm run dev".
const ipsLocales = Object.values(networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i!.address);

// Ojo: aca NO van ignoreBuildErrors ni ignoreDuringBuilds.
// Si hay errores de tipos, el build tiene que fallar.
const nextConfig: NextConfig = {
  allowedDevOrigins: ipsLocales,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
