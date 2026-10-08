import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { PROPORCION, urlMarca } from "@/lib/marca";
import { etiquetaDe, OPERACIONES, type Operacion } from "@/lib/etiquetas";
import { formatearCodigo, formatearDia, formatearFechaHora, noches } from "@/lib/formato";

export type ConsultaNuevaEmailProps = {
  id: string;
  recibida: Date;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number | null;
  propiedad: { code: number; slug: string; title: string; operation: Operacion; zona: string };
  urlAdmin: string;
  urlPropiedad: string;
};

// Mismo lenguaje que el sitio: negro, blanco, grises, pastillas. Fuentes del sistema
// (las de la web no cargan en la mayoria de los clientes de mail).
const FUENTE = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const rotulo = { fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#6E6E73", margin: "0 0 6px" };
const valor = { fontSize: "15px", color: "#0A0A0A", margin: "0 0 18px", lineHeight: "22px" };

export default function ConsultaNuevaEmail(p: ConsultaNuevaEmailProps) {
  const codigo = formatearCodigo(p.propiedad.code);
  const estadia =
    p.checkIn && p.checkOut
      ? formatearDia(p.checkIn) + " → " + formatearDia(p.checkOut) + " (" + noches(p.checkIn, p.checkOut) + " noches)"
      : null;

  return (
    <Html lang="es">
      <Head />
      <Preview>{p.name + " consultó por " + codigo + ": " + p.message.slice(0, 90)}</Preview>
      <Body style={{ backgroundColor: "#F5F5F7", fontFamily: FUENTE, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#FFFFFF", borderRadius: "22px", overflow: "hidden" }}>
          <Section style={{ padding: "26px 32px 22px", borderBottom: "1px solid #EDEDED" }}>
            <Img src={urlMarca("logo-horizontal", 96, "png")} alt="AlquiloPinamar" height="32" width={String(Math.round(32 * PROPORCION["logo-horizontal"]))} style={{ display: "block", height: "32px", width: "auto" }} />
          </Section>

          <Section style={{ padding: "32px 32px 8px" }}>
            <Text style={rotulo}>Consulta nueva · {formatearFechaHora(p.recibida)}</Text>
            <Text style={{ fontSize: "24px", lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.02em", color: "#0A0A0A", margin: "0 0 6px" }}>{p.name}</Text>
            <Text style={{ fontSize: "15px", color: "#6E6E73", margin: "0 0 24px" }}>
              consultó por{" "}
              <Link href={p.urlPropiedad} style={{ color: "#0066CC", textDecoration: "none" }}>
                {codigo} · {p.propiedad.title}
              </Link>{" "}
              ({etiquetaDe(OPERACIONES, p.propiedad.operation)} en {p.propiedad.zona})
            </Text>

            <Section style={{ backgroundColor: "#F5F5F7", borderRadius: "14px", padding: "18px 20px", marginBottom: "24px" }}>
              <Text style={{ fontSize: "15px", lineHeight: "23px", color: "#0A0A0A", margin: 0, whiteSpace: "pre-line" }}>{p.message}</Text>
            </Section>

            {estadia && (
              <>
                <Text style={rotulo}>Estadía</Text>
                <Text style={valor}>{estadia}</Text>
              </>
            )}
            {p.guests && (
              <>
                <Text style={rotulo}>Huéspedes</Text>
                <Text style={valor}>{p.guests}</Text>
              </>
            )}
            <Text style={rotulo}>Mail</Text>
            <Text style={valor}>
              <Link href={"mailto:" + p.email} style={{ color: "#0066CC", textDecoration: "none" }}>
                {p.email}
              </Link>
            </Text>
            {p.phone && (
              <>
                <Text style={rotulo}>Teléfono</Text>
                <Text style={valor}>{p.phone}</Text>
              </>
            )}
          </Section>

          <Section style={{ padding: "0 32px 32px" }}>
            <Button
              href={p.urlAdmin}
              style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF", borderRadius: "999px", padding: "15px 28px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}
            >
              Ver en el admin
            </Button>
            <Text style={{ fontSize: "13px", color: "#6E6E73", margin: "16px 0 0" }}>Si respondés este mail, la respuesta le llega directo a {p.name}.</Text>
          </Section>

          <Hr style={{ borderColor: "#EDEDED", margin: 0 }} />
          <Section style={{ padding: "18px 32px" }}>
            <Text style={{ fontSize: "12px", color: "#A3A3A3", margin: 0 }}>Aviso automático de AlquiloPinamar. Los datos de contacto son privados: no los compartas fuera de la gestión de esta consulta.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
