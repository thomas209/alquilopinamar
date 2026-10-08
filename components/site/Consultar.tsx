"use client";
import { useEffect, useId, useRef, useState } from "react";
import Boton from "@/components/ui/Boton";
import { Campo, CampoArea } from "@/components/ui/Campo";
import Hoja from "@/components/ui/Hoja";
import Icono from "@/components/ui/Icono";
import Rotulo from "@/components/ui/Rotulo";
import { pedir } from "@/lib/pedir";
import type { Operacion } from "@/lib/etiquetas";

export type PropiedadConsulta = {
  slug: string;
  codigo: string;
  title: string;
  operation: Operacion;
  maxGuests: number | null;
  minNights: number | null;
};

const MENSAJES: Record<Operacion, string> = {
  ALQUILER_TEMPORARIO: "Hola, quería consultar disponibilidad y precio para las fechas que indico. ¡Gracias!",
  ALQUILER_ANUAL: "Hola, me interesa esta propiedad en alquiler anual. ¿Sigue disponible? ¿Qué requisitos piden?",
  VENTA: "Hola, me interesa esta propiedad. ¿Podemos coordinar una visita?",
};

// Datos de contacto recordados en este navegador, para no volver a escribirlos.
const CLAVE_CONTACTO = "ap:contacto";
type Contacto = { name: string; email: string; phone: string };

function leerContacto(): Contacto | null {
  try {
    const c = JSON.parse(localStorage.getItem(CLAVE_CONTACTO) ?? "null");
    return c && typeof c.email === "string" ? c : null;
  } catch {
    return null;
  }
}
function guardarContacto(c: Contacto) {
  try {
    localStorage.setItem(CLAVE_CONTACTO, JSON.stringify(c));
  } catch {
    // modo privado o almacenamiento lleno: no pasa nada
  }
}

const hoyIso = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const masDias = (iso: string, dias: number) => new Date(Date.parse(iso + "T00:00:00Z") + dias * 86_400_000).toISOString().slice(0, 10);

// Avisa al servidor de un clic en WhatsApp sin demorar la apertura del chat.
export function avisarEvento(slug: string, tipo: "vista" | "whatsapp") {
  const url = "/api/propiedades/" + encodeURIComponent(slug) + "/evento";
  const cuerpo = JSON.stringify({ tipo });
  try {
    if (navigator.sendBeacon?.(url, new Blob([cuerpo], { type: "application/json" }))) return;
  } catch {
    // sigue con fetch
  }
  fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: cuerpo, keepalive: true }).catch(() => {});
}

// Cuenta una visita a la ficha, una sola vez por sesion del navegador.
export function ContarVista({ slug }: { slug: string }) {
  useEffect(() => {
    const clave = "ap:vista:" + slug;
    try {
      if (sessionStorage.getItem(clave)) return;
      sessionStorage.setItem(clave, "1");
    } catch {
      // sin sessionStorage se cuenta igual
    }
    avisarEvento(slug, "vista");
  }, [slug]);
  return null;
}

// Botones de contacto de la ficha + hoja con el formulario de consulta.
// "panel": tarjeta de precio en compu (botones a todo el ancho).
// "barra": barra fija de abajo en el celular (WhatsApp redondo + Consultar).
export default function Consultar({ propiedad, whatsapp, variante }: { propiedad: PropiedadConsulta; whatsapp: string | null; variante: "panel" | "barra" }) {
  const [abierta, setAbierta] = useState(false);
  const alWhatsapp = () => avisarEvento(propiedad.slug, "whatsapp");

  return (
    <>
      {variante === "panel" ? (
        <div className="flex flex-col gap-3">
          <Boton ancho onClick={() => setAbierta(true)}>
            Consultar
          </Boton>
          {whatsapp && (
            <Boton href={whatsapp} target="_blank" rel="noopener noreferrer" variante="secundario" ancho onClick={alWhatsapp}>
              <Icono nombre="chat" tamano={18} />
              Escribir por WhatsApp
            </Boton>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              onClick={alWhatsapp}
              aria-label="Escribir por WhatsApp"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-gris-100 text-negro transition-transform duration-200 ease-app active:scale-[0.97]"
            >
              <Icono nombre="chat" tamano={19} />
            </a>
          )}
          <Boton tamano="chico" onClick={() => setAbierta(true)}>
            Consultar
          </Boton>
        </div>
      )}

      {abierta && <HojaConsulta propiedad={propiedad} whatsapp={whatsapp} onCerrar={() => setAbierta(false)} onWhatsapp={alWhatsapp} />}
    </>
  );
}

type Errores = Partial<Record<"name" | "email" | "phone" | "message" | "checkIn" | "checkOut", string>>;

function HojaConsulta({ propiedad, whatsapp, onCerrar, onWhatsapp }: { propiedad: PropiedadConsulta; whatsapp: string | null; onCerrar: () => void; onWhatsapp: () => void }) {
  const idForm = useId();
  const temporario = propiedad.operation === "ALQUILER_TEMPORARIO";
  const [contacto] = useState(leerContacto);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadaA, setEnviadaA] = useState<string | null>(null);
  const form = useRef<HTMLFormElement>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (enviando) return;
    const f = new FormData(e.currentTarget);
    const datos = {
      propertySlug: propiedad.slug,
      name: String(f.get("name") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      message: String(f.get("message") ?? "").trim(),
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
      guests: String(f.get("guests") ?? "") || undefined,
      sitio: String(f.get("sitio") ?? ""), // campo trampa
    };

    // Primero se valida aca, para avisar todo junto y sin esperar al servidor
    const nuevos: Errores = {};
    if (datos.name.length < 2) nuevos.name = "Poné tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.email)) nuevos.email = "Revisá el mail.";
    if (datos.message.length < 10) nuevos.message = "Escribí un mensaje un poco más largo.";
    if (Boolean(checkIn) !== Boolean(checkOut)) nuevos[checkIn ? "checkOut" : "checkIn"] = "Completá las dos fechas.";
    if (checkIn && checkOut && checkOut <= checkIn) nuevos.checkOut = "Tiene que ser después de la llegada.";
    setErrores(nuevos);
    setErrorGeneral("");
    if (Object.keys(nuevos).length > 0) {
      form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }

    setEnviando(true);
    const r = await pedir("/api/consultas", "POST", datos);
    setEnviando(false);
    if (!r.ok) {
      setErrorGeneral(r.error);
      return;
    }
    guardarContacto({ name: datos.name, email: datos.email, phone: datos.phone });
    setEnviadaA(datos.email);
  }

  if (enviadaA) {
    return (
      <Hoja
        abierta
        onCerrar={onCerrar}
        titulo="Consulta enviada"
        pie={
          <Boton ancho onClick={onCerrar}>
            Listo
          </Boton>
        }
      >
        <div className="flex flex-col items-start gap-4 pt-2">
          <span className="grid size-12 place-items-center rounded-full bg-ok/10 text-ok">
            <Icono nombre="check" tamano={22} />
          </span>
          <p className="text-[16px] leading-relaxed">
            Recibimos tu consulta por <strong className="font-medium">{propiedad.codigo}</strong>. Te van a responder a <strong className="font-medium">{enviadaA}</strong>.
          </p>
          <p className="text-[14px] text-texto-2">Revisá también la carpeta de spam.</p>
          {whatsapp && (
            <Boton href={whatsapp} target="_blank" rel="noopener noreferrer" variante="texto" onClick={onWhatsapp}>
              ¿Es urgente? Escribí por WhatsApp
            </Boton>
          )}
        </div>
      </Hoja>
    );
  }

  return (
    <Hoja
      abierta
      onCerrar={onCerrar}
      titulo="Consultar"
      pie={
        <>
          {errorGeneral && (
            <p role="alert" className="text-[14px] text-error">
              {errorGeneral}
            </p>
          )}
          <Boton type="submit" form={idForm} ancho disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar consulta"}
          </Boton>
          <p className="text-center text-[12px] text-texto-2">
            Tus datos solo los ve quien publica la propiedad.{" "}
            <a href="/privacidad" target="_blank" className="underline underline-offset-2">
              Privacidad
            </a>
          </p>
        </>
      }
    >
      <form id={idForm} ref={form} onSubmit={enviar} noValidate className="space-y-5">
        <div className="rounded-campo bg-gris-50 px-4 py-3">
          <Rotulo como="p">{propiedad.codigo}</Rotulo>
          <p className="mt-1.5 truncate text-[15px] font-medium">{propiedad.title}</p>
        </div>

        {temporario && (
          <div className="grid grid-cols-2 gap-3">
            <Campo
              etiqueta="Llegada"
              type="date"
              name="checkIn"
              min={hoyIso()}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value && (!checkOut || checkOut <= e.target.value)) setCheckOut(masDias(e.target.value, propiedad.minNights ?? 1));
              }}
              error={errores.checkIn}
            />
            <Campo etiqueta="Salida" type="date" name="checkOut" min={checkIn ? masDias(checkIn, 1) : hoyIso()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} error={errores.checkOut} />
            <Campo
              etiqueta="Huéspedes"
              type="number"
              name="guests"
              inputMode="numeric"
              min={1}
              max={propiedad.maxGuests ?? 50}
              placeholder={propiedad.maxGuests ? "Hasta " + propiedad.maxGuests : "Cantidad"}
              className="col-span-2"
            />
          </div>
        )}

        <Campo etiqueta="Nombre" name="name" autoComplete="name" defaultValue={contacto?.name} required maxLength={80} error={errores.name} />
        <Campo etiqueta="Mail" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={contacto?.email} required maxLength={120} error={errores.email} />
        <Campo etiqueta="Teléfono (opcional)" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={contacto?.phone} maxLength={30} ayuda="Con WhatsApp, si querés que te escriban por ahí." error={errores.phone} />
        <CampoArea etiqueta="Mensaje" name="message" rows={4} defaultValue={MENSAJES[propiedad.operation]} required maxLength={2000} error={errores.message} />

        {/* Campo trampa para robots: invisible para las personas */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label>
            Sitio web
            <input type="text" name="sitio" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </form>
    </Hoja>
  );
}
