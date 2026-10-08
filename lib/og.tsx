// Imagenes para compartir (WhatsApp, redes, Google Discover): 1200x630.
// Mismo lenguaje que el sitio: blanco y negro, Instrument Sans en titulos,
// DM Mono en rotulos. Las fuentes estan en assets/fonts (licencia OFL).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NOMBRE, ZONAS_TEXTO } from "@/lib/seo";

export const TAMANO_OG = { width: 1200, height: 630 };

const fuente = (archivo: string) => readFile(join(process.cwd(), "assets/fonts", archivo));

async function fuentes() {
  const [titulo, texto, rotulo] = await Promise.all([
    fuente("instrument-sans-latin-600-normal.woff"),
    fuente("inter-latin-500-normal.woff"),
    fuente("dm-mono-latin-400-normal.woff"),
  ]);
  return [
    { name: "Instrument Sans", data: titulo, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: texto, weight: 500 as const, style: "normal" as const },
    { name: "DM Mono", data: rotulo, weight: 400 as const, style: "normal" as const },
  ];
}

const NEGRO = "#0A0A0A";
const GRIS = "#6E6E73";

function Rotulo({ children, color = GRIS }: { children: string; color?: string }) {
  return <div style={{ fontFamily: "DM Mono", fontSize: 22, letterSpacing: "0.1em", color, display: "flex" }}>{children.toUpperCase()}</div>;
}

function Marca({ claro = false }: { claro?: boolean }) {
  return <div style={{ fontFamily: "Instrument Sans", fontSize: 34, letterSpacing: "-0.02em", color: claro ? "#FFFFFF" : NEGRO, display: "flex" }}>{SITE_NOMBRE}</div>;
}

// Version sin foto: fondo blanco, titulo grande. La usa el sitio en general
// y cualquier pagina que no tenga una foto propia.
function SinFoto({ rotulo, titulo, pie }: { rotulo: string; titulo: string; pie: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFFFFF", padding: "72px 80px", fontFamily: "Inter" }}>
      <Rotulo>{rotulo}</Rotulo>
      <div style={{ fontFamily: "Instrument Sans", fontSize: titulo.length > 22 ? 84 : 104, lineHeight: 1.02, letterSpacing: "-0.03em", color: NEGRO, display: "flex", maxWidth: 1000 }}>{titulo}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Marca />
        <div style={{ display: "flex", background: NEGRO, color: "#FFFFFF", borderRadius: 999, padding: "16px 30px", fontSize: 24 }}>{pie}</div>
      </div>
    </div>
  );
}

// Version con foto de borde a borde y una tarjeta blanca abajo (como el hero del sitio).
function ConFoto({ foto, rotulo, titulo, pie }: { foto: string; rotulo: string; titulo: string; pie: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#EDEDED", fontFamily: "Inter" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
      <img src={foto} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 48, bottom: 48, display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.92)", borderRadius: 30, padding: "30px 38px", maxWidth: 820 }}>
        <Rotulo>{rotulo}</Rotulo>
        <div style={{ fontFamily: "Instrument Sans", fontSize: titulo.length > 18 ? 64 : 80, lineHeight: 1.04, letterSpacing: "-0.03em", color: NEGRO, marginTop: 14, display: "flex" }}>{titulo}</div>
        <div style={{ fontSize: 24, color: GRIS, marginTop: 14, display: "flex" }}>{pie}</div>
      </div>
      <div style={{ position: "absolute", top: 40, right: 48, display: "flex", background: "rgba(10,10,10,0.78)", borderRadius: 999, padding: "12px 24px" }}>
        <div style={{ fontFamily: "Instrument Sans", fontSize: 26, letterSpacing: "-0.02em", color: "#FFFFFF", display: "flex" }}>{SITE_NOMBRE}</div>
      </div>
    </div>
  );
}

export async function imagenOg(datos: { rotulo?: string; titulo: string; pie: string; foto?: string | null }) {
  const rotulo = datos.rotulo ?? ZONAS_TEXTO;
  return new ImageResponse(
    datos.foto ? <ConFoto foto={datos.foto} rotulo={rotulo} titulo={datos.titulo} pie={datos.pie} /> : <SinFoto rotulo={rotulo} titulo={datos.titulo} pie={datos.pie} />,
    { ...TAMANO_OG, fonts: await fuentes() },
  );
}
