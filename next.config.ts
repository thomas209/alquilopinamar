import type { NextConfig } from "next";

// Ojo: aca NO van ignoreBuildErrors ni ignoreDuringBuilds.
// Si hay errores de tipos, el build tiene que fallar.
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
