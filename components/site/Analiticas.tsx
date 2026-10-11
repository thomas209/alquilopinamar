"use client";
import { Analytics } from "@vercel/analytics/next";

// Vercel Analytics, sin mandar el token del link de ingreso (va en la URL de /cuenta/entrar).
export default function Analiticas() {
  return <Analytics beforeSend={(e) => (e.url.includes("/cuenta/entrar") ? { ...e, url: e.url.split("?")[0] } : e)} />;
}
