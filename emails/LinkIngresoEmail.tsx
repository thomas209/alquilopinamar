import { Body, Button, Container, Head, Html, Img, Preview, Section, Text } from "@react-email/components";
import { PROPORCION, urlMarca } from "@/lib/marca";

export type LinkIngresoEmailProps = { url: string; minutos: number };

const FUENTE = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

// Link para entrar a la cuenta, sin contraseña.
export default function LinkIngresoEmail({ url, minutos }: LinkIngresoEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu link para entrar a AlquiloPinamar (vale {String(minutos)} minutos)</Preview>
      <Body style={{ backgroundColor: "#F5F5F7", fontFamily: FUENTE, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: "520px", margin: "0 auto", backgroundColor: "#FFFFFF", borderRadius: "22px", overflow: "hidden" }}>
          <Section style={{ padding: "26px 32px 22px", borderBottom: "1px solid #EDEDED" }}>
            <Img src={urlMarca("logo-horizontal", 96, "png")} alt="AlquiloPinamar" height="32" width={String(Math.round(32 * PROPORCION["logo-horizontal"]))} style={{ display: "block", height: "32px", width: "auto" }} />
          </Section>
          <Section style={{ padding: "32px 32px 30px" }}>
            <Text style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6E6E73", margin: "0 0 10px" }}>Ingresar</Text>
            <Text style={{ fontSize: "24px", lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.02em", color: "#0A0A0A", margin: "0 0 12px" }}>Entrá a tu cuenta</Text>
            <Text style={{ fontSize: "15px", lineHeight: "23px", color: "#6E6E73", margin: "0 0 26px" }}>
              Tocá el botón para entrar. El link sirve una sola vez y vence en {minutos} minutos.
            </Text>
            <Button href={url} style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF", borderRadius: "999px", padding: "16px 28px", fontSize: "16px", fontWeight: 500, textDecoration: "none", display: "inline-block" }}>
              Entrar a AlquiloPinamar
            </Button>
            <Text style={{ fontSize: "13px", lineHeight: "20px", color: "#A3A3A3", margin: "28px 0 0" }}>
              Si no lo pediste vos, ignorá este mail: nadie puede entrar sin tocar el link.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
