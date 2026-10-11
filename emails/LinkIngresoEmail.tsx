import { Body, Button, Container, Head, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";
import { PROPORCION, urlMarca } from "@/lib/marca";

export type LinkIngresoEmailProps = {
  url: string;
  minutos: number;
};

// Mismo lenguaje que el aviso de consultas: negro, blanco, grises, pastillas.
const FUENTE = "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

export default function LinkIngresoEmail({ url, minutos }: LinkIngresoEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu link para entrar a AlquiloPinamar. Vence en {String(minutos)} minutos.</Preview>
      <Body style={{ backgroundColor: "#F5F5F7", fontFamily: FUENTE, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", backgroundColor: "#FFFFFF", borderRadius: "22px", overflow: "hidden" }}>
          <Section style={{ padding: "26px 32px 22px", borderBottom: "1px solid #EDEDED" }}>
            <Img src={urlMarca("logo-horizontal", 96, "png")} alt="AlquiloPinamar" height="32" width={String(Math.round(32 * PROPORCION["logo-horizontal"]))} style={{ display: "block", height: "32px", width: "auto" }} />
          </Section>

          <Section style={{ padding: "32px 32px 8px" }}>
            <Text style={{ fontFamily: MONO, fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6E6E73", margin: "0 0 10px" }}>Tu cuenta</Text>
            <Text style={{ fontSize: "24px", lineHeight: "30px", fontWeight: 600, letterSpacing: "-0.02em", color: "#0A0A0A", margin: "0 0 12px" }}>Entrá a AlquiloPinamar</Text>
            <Text style={{ fontSize: "15px", lineHeight: "23px", color: "#0A0A0A", margin: "0 0 26px" }}>
              Tocá el botón para entrar. No hace falta contraseña. El link sirve una sola vez y vence en {minutos} minutos.
            </Text>
            <Button href={url} style={{ backgroundColor: "#0A0A0A", color: "#FFFFFF", borderRadius: "999px", padding: "15px 28px", fontSize: "15px", fontWeight: 600, textDecoration: "none" }}>
              Entrar
            </Button>
            <Text style={{ fontSize: "13px", lineHeight: "20px", color: "#6E6E73", margin: "26px 0 6px" }}>Si el botón no anda, copiá este link en el navegador:</Text>
            <Text style={{ fontSize: "13px", lineHeight: "20px", margin: "0 0 28px", wordBreak: "break-all" }}>
              <Link href={url} style={{ color: "#0066CC", textDecoration: "none" }}>
                {url}
              </Link>
            </Text>
          </Section>

          <Hr style={{ borderColor: "#EDEDED", margin: 0 }} />
          <Section style={{ padding: "18px 32px" }}>
            <Text style={{ fontSize: "12px", lineHeight: "18px", color: "#A3A3A3", margin: 0 }}>
              Si no pediste entrar, ignorá este mail: nadie puede entrar a tu cuenta sin este link. No lo reenvíes.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
