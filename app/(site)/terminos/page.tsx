import Link from "next/link";
import { Clausula, PaginaTexto } from "@/components/site/PaginaTexto";
import { EMPRESA, LEGALES_ACTUALIZADOS } from "@/lib/empresa";
import { metadataDePagina } from "@/lib/seo";

export const metadata = metadataDePagina({
  titulo: "Términos y condiciones",
  descripcion: "Condiciones de uso de AlquiloPinamar: cómo funciona el sitio, qué responsabilidades tiene cada parte y cómo contactarnos.",
  ruta: "/terminos",
});

export default function TerminosPage() {
  return (
    <PaginaTexto rotulo={"Actualizados el " + LEGALES_ACTUALIZADOS} titulo="Términos y condiciones" bajada="Al usar AlquiloPinamar aceptás estas condiciones. Las escribimos en lenguaje simple: si algo no queda claro, escribinos.">
      <Clausula id="quienes" titulo="1. Quiénes somos">
        <p>
          AlquiloPinamar (el “Sitio”) es un sitio de avisos de propiedades en alquiler temporario, alquiler anual y venta en el Partido de Pinamar, provincia de Buenos Aires
          {EMPRESA.titular ? ", administrado por " + EMPRESA.titular : ""}
          {EMPRESA.titular && EMPRESA.cuit ? ", CUIT " + EMPRESA.cuit : ""}
          {EMPRESA.titular && EMPRESA.domicilio ? ", con domicilio en " + EMPRESA.domicilio : ""}.
        </p>
      </Clausula>

      <Clausula id="servicio" titulo="2. Qué hace el Sitio">
        <p>El Sitio publica avisos de propiedades y pone en contacto a quienes buscan con quienes publican (dueños, anfitriones o inmobiliarias, los “Anunciantes”).</p>
        <p>
          <strong className="font-medium">AlquiloPinamar no es dueño de las propiedades ni es parte de los contratos</strong> de alquiler o compraventa que se acuerden entre interesados y Anunciantes. Tampoco cobra ni administra señas, pagos ni depósitos.
        </p>
        <p>Hoy publicar y consultar es gratis. Si en el futuro se suman servicios pagos, se informarán antes de contratarlos.</p>
      </Clausula>

      <Clausula id="avisos" titulo="3. Información de los avisos">
        <p>Cada Anunciante es responsable de que la información, las fotos y los precios de su aviso sean verdaderos y estén actualizados, y de contar con las autorizaciones y habilitaciones que correspondan para alquilar o vender.</p>
        <p>Revisamos las publicaciones antes de mostrarlas, pero no podemos verificar cada dato. Los precios y la disponibilidad son informativos y se confirman siempre con el Anunciante. Podemos editar, pausar o dar de baja un aviso que no cumpla estas condiciones.</p>
        <p>Está prohibido publicar datos falsos, propiedades que no se pueden ofrecer, contenido ofensivo o discriminatorio, o datos de contacto dentro de la descripción o las fotos.</p>
      </Clausula>

      <Clausula id="consultas" titulo="4. Consultas y acuerdos">
        <p>Cuando consultás desde una ficha, tus datos y tu mensaje se envían al Anunciante para que te responda (ver la <Link href="/privacidad">Política de privacidad</Link>). La negociación, la reserva, el pago y la entrega de la propiedad se acuerdan directamente con el Anunciante.</p>
        <p>Te recomendamos verificar la identidad de la otra parte, visitar la propiedad cuando sea posible y pedir siempre un comprobante o contrato antes de pagar. AlquiloPinamar nunca te va a pedir pagos ni datos de tarjetas.</p>
      </Clausula>

      <Clausula id="uso" titulo="5. Uso del Sitio">
        <p>No está permitido usar el Sitio para enviar spam, extraer datos en forma automatizada, intentar acceder a áreas restringidas ni afectar su funcionamiento. Podemos limitar el acceso a quien lo haga.</p>
      </Clausula>

      <Clausula id="responsabilidad" titulo="6. Responsabilidad">
        <p>
          Trabajamos para que el Sitio funcione bien y sin interrupciones, pero no garantizamos que esté siempre disponible ni libre de errores. En la medida que lo permita la ley, AlquiloPinamar no responde por el estado de las propiedades, por el cumplimiento de los acuerdos entre las partes ni por los daños que surjan de esos acuerdos. Nada de lo dicho aquí limita los derechos que te reconoce la Ley 24.240 de Defensa del Consumidor.
        </p>
      </Clausula>

      <Clausula id="propiedad-intelectual" titulo="7. Contenido y marca">
        <p>El diseño, los textos y la marca AlquiloPinamar son de su titular. Las fotos y descripciones de cada aviso son del Anunciante, que nos autoriza a mostrarlas en el Sitio y a compartirlas para difundir el aviso.</p>
      </Clausula>

      <Clausula id="cambios" titulo="8. Cambios">
        <p>Podemos actualizar estos términos. La fecha de la última versión figura arriba; si el cambio es importante, lo vamos a avisar en el Sitio.</p>
      </Clausula>

      <Clausula id="ley" titulo="9. Ley aplicable">
        <p>Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto son competentes los tribunales ordinarios que correspondan según la ley, incluidos los del domicilio del consumidor.</p>
      </Clausula>

      <Clausula id="contacto" titulo="10. Contacto">
        <p>
          Por dudas o reclamos, escribinos desde la página de <Link href="/contacto">contacto</Link>
          {EMPRESA.email ? (
            <>
              {" "}o a <a href={"mailto:" + EMPRESA.email}>{EMPRESA.email}</a>
            </>
          ) : null}
          .
        </p>
      </Clausula>
    </PaginaTexto>
  );
}
