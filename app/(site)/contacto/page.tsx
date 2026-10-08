import Boton from "@/components/ui/Boton";
import { Card } from "@/components/ui/Card";
import Icono from "@/components/ui/Icono";
import Rotulo from "@/components/ui/Rotulo";
import { PaginaTexto } from "@/components/site/PaginaTexto";
import { EMPRESA, whatsappLegible } from "@/lib/empresa";
import { metadataDePagina } from "@/lib/seo";
import { linkWhatsapp } from "@/lib/whatsapp";

export const metadata = metadataDePagina({
  titulo: "Contacto",
  descripcion: "Escribinos por WhatsApp o por mail para consultas generales o para publicar tu propiedad en AlquiloPinamar.",
  ruta: "/contacto",
});

export default function ContactoPage() {
  const { whatsapp, email, instagram } = EMPRESA;
  const hayCanales = Boolean(whatsapp || email || instagram);

  return (
    <PaginaTexto
      rotulo="Contacto"
      titulo="Hablemos."
      bajada={
        <>
          Si te interesa una propiedad, lo más rápido es consultar desde su ficha: el mensaje le llega directo a quien la publica. Para todo lo demás, escribinos.
        </>
      }
    >
      {hayCanales ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {whatsapp && (
            <Card>
              <Icono nombre="chat" tamano={22} />
              <Rotulo como="p" className="mt-4">
                WhatsApp
              </Rotulo>
              <p className="mt-2 font-titulo text-[20px] font-medium tracking-[-0.02em] tabular-nums">{whatsappLegible(whatsapp)}</p>
              <Boton href={linkWhatsapp(whatsapp, "Hola, les escribo desde la web de AlquiloPinamar.")} target="_blank" rel="noopener noreferrer" tamano="chico" className="mt-5">
                Escribir
              </Boton>
            </Card>
          )}
          {email && (
            <Card>
              <Icono nombre="mail" tamano={22} />
              <Rotulo como="p" className="mt-4">
                Mail
              </Rotulo>
              <p className="mt-2 font-titulo text-[20px] font-medium tracking-[-0.02em] break-all">{email}</p>
              <Boton href={"mailto:" + email} tamano="chico" className="mt-5">
                Enviar mail
              </Boton>
            </Card>
          )}
          {instagram && (
            <Card>
              <Rotulo como="p">Instagram</Rotulo>
              <a href={"https://instagram.com/" + instagram} target="_blank" rel="noopener noreferrer" className="mt-2 block font-titulo text-[20px] font-medium tracking-[-0.02em] text-link">
                @{instagram}
              </a>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <p className="text-[16px] leading-relaxed">Para consultar por una propiedad, entrá a su ficha y tocá “Consultar”. Te responde quien la publica.</p>
          <Boton href="/propiedades" tamano="chico" className="mt-5">
            Ver propiedades
          </Boton>
        </Card>
      )}

      <section id="publicar" className="mt-14 scroll-mt-24 border-t border-gris-200 pt-10">
        <Rotulo como="p">Para propietarios</Rotulo>
        <h2 className="mt-3 font-titulo text-[26px] leading-tight font-semibold tracking-[-0.02em] md:text-[32px]">Publicá tu propiedad gratis.</h2>
        <ol className="mt-6 space-y-4 text-[16px] leading-relaxed">
          {[
            "Escribinos con la zona, el tipo de propiedad y si es para alquiler temporario, anual o venta.",
            "Mandanos al menos 5 fotos buenas, horizontales y con luz natural, y los datos principales: ambientes, dormitorios, baños, capacidad y precio.",
            "La cargamos, la revisás y queda publicada. Las consultas te llegan directo.",
          ].map((paso, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-negro font-titulo text-[14px] font-semibold text-blanco tabular-nums">{i + 1}</span>
              <span className="pt-0.5">{paso}</span>
            </li>
          ))}
        </ol>
        {whatsapp && (
          <Boton href={linkWhatsapp(whatsapp, "Hola, quiero publicar mi propiedad en AlquiloPinamar.")} target="_blank" rel="noopener noreferrer" className="mt-8">
            Quiero publicar
          </Boton>
        )}
      </section>

      <section className="mt-14 border-t border-gris-200 pt-10">
        <Rotulo como="p">Consejos de seguridad</Rotulo>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-texto-2">
          <li>Antes de pagar una seña, verificá la identidad de quien alquila o vende y, si podés, visitá la propiedad.</li>
          <li>Desconfiá de precios muy por debajo de lo habitual o de pedidos de pago urgentes.</li>
          <li>Pedí siempre un comprobante o contrato con los datos de ambas partes.</li>
          <li>AlquiloPinamar nunca te va a pedir pagos ni datos de tarjetas por WhatsApp o por mail.</li>
        </ul>
      </section>
    </PaginaTexto>
  );
}
