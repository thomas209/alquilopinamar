import Link from "next/link";
import { Clausula, PaginaTexto } from "@/components/site/PaginaTexto";
import { EMPRESA, LEGALES_ACTUALIZADOS } from "@/lib/empresa";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Política de privacidad",
  descripcion: "Qué datos personales usa AlquiloPinamar, para qué, con quién los comparte y cómo ejercer tus derechos según la Ley 25.326.",
  ruta: "/privacidad",
});

export default function PrivacidadPage() {
  const contacto = EMPRESA.email ? (
    <a href={"mailto:" + EMPRESA.email}>{EMPRESA.email}</a>
  ) : (
    <Link href="/contacto">nuestra página de contacto</Link>
  );

  return (
    <PaginaTexto rotulo={"Actualizada el " + LEGALES_ACTUALIZADOS} titulo="Política de privacidad" bajada="Usamos solo los datos necesarios para que puedas consultar por una propiedad y para que el sitio funcione. No los vendemos ni los usamos para publicidad.">
      <Clausula id="responsable" titulo="1. Responsable">
        <p>
          {EMPRESA.titular ? (
            <>
              El responsable de los datos es {EMPRESA.titular}
              {EMPRESA.cuit ? ", CUIT " + EMPRESA.cuit : ""}
              {EMPRESA.domicilio ? ", con domicilio en " + EMPRESA.domicilio : ""}, titular de AlquiloPinamar.
            </>
          ) : (
            "El responsable de los datos es el titular de AlquiloPinamar."
          )}{" "}
          Podés escribirnos a {contacto}.
        </p>
      </Clausula>

      <Clausula id="datos" titulo="2. Qué datos usamos">
        <ul>
          <li>
            <strong className="font-medium">Cuando consultás por una propiedad:</strong> tu nombre, mail, teléfono (si lo dejás), el mensaje y, si las indicás, las fechas y la cantidad de huéspedes.
          </li>
          <li>
            <strong className="font-medium">Para evitar abusos:</strong> un código derivado de tu dirección IP, que no permite saber cuál es la IP original. Sirve para limitar la cantidad de consultas seguidas.
          </li>
          <li>
            <strong className="font-medium">Estadísticas:</strong> cuántas veces se ve cada propiedad y cuántas veces se toca el botón de WhatsApp, sin identificar a nadie. También usamos Vercel Analytics, que mide visitas en forma agregada y sin cookies.
          </li>
          <li>
            <strong className="font-medium">En tu navegador:</strong> para no tener que escribirlos de nuevo, tu nombre, mail y teléfono quedan guardados en tu propio dispositivo después de una consulta. Podés borrarlos limpiando los datos del sitio en tu navegador.
          </li>
        </ul>
        <p>No usamos cookies de publicidad ni de seguimiento de terceros.</p>
      </Clausula>

      <Clausula id="finalidad" titulo="3. Para qué los usamos">
        <ul>
          <li>Hacerle llegar tu consulta a quien publica la propiedad, para que te responda.</li>
          <li>Responderte nosotros, si la consulta es para AlquiloPinamar.</li>
          <li>Prevenir el spam y el uso indebido del sitio.</li>
          <li>Saber qué funciona y mejorar el sitio.</li>
        </ul>
      </Clausula>

      <Clausula id="compartir" titulo="4. Con quién los compartimos">
        <p>Tus datos de contacto los ve solo quien publica la propiedad por la que consultás y el equipo de AlquiloPinamar. No los vendemos ni los cedemos para publicidad.</p>
        <p>
          Para funcionar usamos proveedores que guardan o procesan datos por cuenta nuestra: Vercel (alojamiento del sitio), Railway (base de datos), Cloudinary (fotos) y Resend (envío de mails). Algunos de estos servicios están fuera de la Argentina; trabajamos con proveedores que aplican medidas de seguridad adecuadas.
        </p>
      </Clausula>

      <Clausula id="conservacion" titulo="5. Cuánto tiempo los guardamos">
        <p>Guardamos las consultas mientras sean necesarias para gestionarlas y para el historial de la propiedad. Podés pedir que borremos las tuyas en cualquier momento.</p>
      </Clausula>

      <Clausula id="derechos" titulo="6. Tus derechos">
        <p>
          Podés pedir acceso, rectificación, actualización o supresión de tus datos escribiéndonos a {contacto}. El derecho de acceso es gratuito y puede ejercerse en intervalos no inferiores a seis meses, salvo que acredites un interés legítimo (art. 14, inc. 3, Ley 25.326).
        </p>
        <p className="rounded-campo bg-gris-50 p-4 text-[14px] text-texto-2">
          La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
        </p>
      </Clausula>

      <Clausula id="seguridad" titulo="7. Seguridad">
        <p>Protegemos los datos con conexiones cifradas, accesos restringidos al panel de administración y copias de seguridad. Ningún sistema es infalible: si detectáramos un incidente que afecte tus datos, te lo vamos a informar.</p>
      </Clausula>

      <Clausula id="cambios" titulo="8. Cambios">
        <p>
          Si cambiamos esta política, actualizamos la fecha de arriba. Ver también los <Link href="/terminos">Términos y condiciones</Link>.
        </p>
      </Clausula>
    </PaginaTexto>
  );
}
