// Mails del sitio (Resend + React Email).
//
// Mientras no haya dominio propio verificado en Resend, los mails salen desde
// onboarding@resend.dev y SOLO llegan al mail con el que se creo la cuenta de
// Resend. Para avisos al admin alcanza. Cuando haya dominio:
//   1) Resend → Domains → Add Domain, y cargar los DNS que pide.
//   2) RESEND_FROM_EMAIL="AlquiloPinamar <avisos@dominio.com.ar>"
//
// Si falta RESEND_API_KEY o ADMIN_EMAIL no se manda nada y queda un aviso en
// el log: la consulta igual se guarda y se ve en /admin/consultas.
import { Resend } from "resend";
import ConsultaNuevaEmail, { type ConsultaNuevaEmailProps } from "@/emails/ConsultaNuevaEmail";
import LinkIngresoEmail from "@/emails/LinkIngresoEmail";
import { formatearCodigo } from "@/lib/formato";

const FROM = process.env.RESEND_FROM_EMAIL || "AlquiloPinamar <onboarding@resend.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

let cliente: Resend | null = null;
function resend(): Resend | null {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return null;
  cliente ??= new Resend(clave);
  return cliente;
}

// Aviso al admin de una consulta nueva. Nunca tira error: devuelve si se mando.
export async function avisarConsultaNueva(c: Omit<ConsultaNuevaEmailProps, "urlAdmin" | "urlPropiedad">): Promise<boolean> {
  const r = resend();
  const para = process.env.ADMIN_EMAIL;
  if (!r || !para) {
    console.warn("[email] Falta RESEND_API_KEY o ADMIN_EMAIL: no se avisó la consulta " + c.id);
    return false;
  }
  try {
    const { error } = await r.emails.send({
      from: FROM,
      to: para.split(",").map((m) => m.trim()).filter(Boolean),
      replyTo: c.email, // "Responder" en el mail le contesta directo a quien consultó
      subject: "Consulta de " + c.name + " · " + formatearCodigo(c.propiedad.code) + " " + c.propiedad.title,
      react: ConsultaNuevaEmail({
        ...c,
        urlAdmin: SITE_URL + "/admin/consultas/" + c.id,
        urlPropiedad: SITE_URL + "/propiedad/" + c.propiedad.slug,
      }),
    });
    if (error) {
      console.error("[email] Error de Resend avisando la consulta " + c.id + ":", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] No se pudo avisar la consulta " + c.id + ":", e);
    return false;
  }
}

// Link de ingreso a la cuenta. En desarrollo, sin clave de Resend, el link se
// muestra en la terminal para poder probar. Nunca tira error.
export async function mandarLinkIngreso(para: string, url: string, minutos: number): Promise<"enviado" | "sin-config" | "error"> {
  const r = resend();
  if (!r) {
    if (process.env.NODE_ENV !== "production") {
      console.info("\n[email] Link para entrar (" + para + "):\n" + url + "\n");
      return "enviado";
    }
    console.warn("[email] Falta RESEND_API_KEY: no se pudo mandar el link de ingreso");
    return "sin-config";
  }
  try {
    const { error } = await r.emails.send({
      from: FROM,
      to: para,
      subject: "Tu link para entrar a AlquiloPinamar",
      react: LinkIngresoEmail({ url, minutos }),
    });
    if (error) {
      console.error("[email] Error de Resend mandando el link de ingreso:", error);
      return "error";
    }
    return "enviado";
  } catch (e) {
    console.error("[email] No se pudo mandar el link de ingreso:", e);
    return "error";
  }
}
