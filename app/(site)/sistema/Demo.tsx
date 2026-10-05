"use client";
import { useState } from "react";
import Boton from "@/components/ui/Boton";
import { Campo, CampoArea, CampoSelect } from "@/components/ui/Campo";
import { Card, CardFoto } from "@/components/ui/Card";
import Esqueleto from "@/components/ui/Esqueleto";
import Hoja from "@/components/ui/Hoja";
import Icono, { type NombreIcono } from "@/components/ui/Icono";
import { Contador, PastillaEstado, PastillaFiltro } from "@/components/ui/Pastilla";
import Precio from "@/components/ui/Precio";
import Rotulo from "@/components/ui/Rotulo";
import Segmentado from "@/components/ui/Segmentado";

const COLORES = [
  { nombre: "Negro", clase: "bg-negro", hex: "#0A0A0A" },
  { nombre: "Blanco", clase: "bg-blanco border border-gris-200", hex: "#FFFFFF" },
  { nombre: "Gris 50", clase: "bg-gris-50", hex: "#F5F5F7" },
  { nombre: "Gris 100", clase: "bg-gris-100", hex: "#F4F4F4" },
  { nombre: "Gris 200", clase: "bg-gris-200", hex: "#EDEDED" },
  { nombre: "Gris 400", clase: "bg-gris-400", hex: "#A3A3A3" },
  { nombre: "Texto 2", clase: "bg-texto-2", hex: "#6E6E73" },
  { nombre: "Link", clase: "bg-link", hex: "#0066CC" },
  { nombre: "Ok", clase: "bg-ok", hex: "#16A34A" },
  { nombre: "Error", clase: "bg-error", hex: "#DC2626" },
];

const ICONOS: NombreIcono[] = [
  "corazon", "buscar", "filtros", "menu", "pin", "calendario", "personas", "cama",
  "usuario", "compartir", "check", "cerrar", "flecha-izq", "flecha-der", "flecha-abajo",
];

const AMENITIES = ["Pileta", "Parrilla", "Wifi", "Aire acondicionado", "Mascotas"];

type Operacion = "temporario" | "anual" | "venta";
type Tipo = "casa" | "departamento" | "duplex" | "cabana" | "lote" | "local";

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gris-200 py-10 md:py-14">
      <Rotulo como="p" className="mb-6">
        {titulo}
      </Rotulo>
      {children}
    </section>
  );
}

export default function Demo() {
  const [operacion, setOperacion] = useState<Operacion>("temporario");
  const [tipo, setTipo] = useState<Tipo>("casa");
  const [amenities, setAmenities] = useState<string[]>(["Pileta"]);
  const [favorito, setFavorito] = useState(false);
  const [panel, setPanel] = useState(false);
  const [cartel, setCartel] = useState(false);

  const alternar = (a: string) =>
    setAmenities((actual) => (actual.includes(a) ? actual.filter((x) => x !== a) : [...actual, a]));

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-24 md:px-12">
      <header className="py-10 md:py-16">
        <Rotulo como="p">AlquiloPinamar · Design system</Rotulo>
        <h1 className="mt-3 font-titulo text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
          Componentes base
        </h1>
        <p className="mt-3 max-w-[52ch] text-[15px] text-texto-2">
          Todo lo que se ve en el sitio se arma con estas piezas. Si acá algo no te gusta, se cambia una sola vez y cambia en todos lados.
        </p>
      </header>

      <Seccion titulo="Colores">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {COLORES.map((c) => (
            <div key={c.nombre}>
              <div className={"h-16 rounded-campo " + c.clase} />
              <p className="mt-2 text-[13px] font-medium">{c.nombre}</p>
              <Rotulo className="mt-1 block text-[10px]">{c.hex}</Rotulo>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion titulo="Tipografía">
        <div className="flex flex-col gap-5">
          <div>
            <Rotulo>Instrument Sans · títulos y precios</Rotulo>
            <p className="mt-2 font-titulo text-[34px] leading-[1.08] font-semibold tracking-[-0.02em]">Casa en el bosque de Cariló</p>
          </div>
          <div>
            <Rotulo>Inter · lectura</Rotulo>
            <p className="mt-2 max-w-[60ch] text-[15px]">
              A 300 metros del mar, con pileta climatizada, parrilla y cuatro dormitorios. Ideal para dos familias.
            </p>
          </div>
          <div>
            <Rotulo>DM Mono · rótulos</Rotulo>
            <p className="mt-2">
              <Rotulo tono="negro">AP-0123 · Cariló · Casa</Rotulo>
            </p>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <Precio monto={250} moneda="USD" periodo="NOCHE" tamano="ficha" />
            <Precio monto={850000} moneda="ARS" periodo="MES" tamano="ficha" />
            <Precio monto={320000} moneda="USD" periodo="TOTAL" tamano="ficha" />
            <Precio monto={null} tamano="ficha" />
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Botones">
        <div className="flex flex-wrap items-center gap-3">
          <Boton tamano="grande">Consultar</Boton>
          <Boton>Buscar</Boton>
          <Boton tamano="chico">Ver más</Boton>
          <Boton variante="secundario">WhatsApp</Boton>
          <Boton variante="secundario" tamano="chico">
            <Icono nombre="filtros" tamano={16} />
            Filtrar
            <Contador>3</Contador>
          </Boton>
          <Boton disabled>Deshabilitado</Boton>
          <Boton variante="texto">Limpiar filtros</Boton>
        </div>
        <div className="mt-4 max-w-[420px]">
          <Boton tamano="grande" ancho>
            Enviar consulta
          </Boton>
        </div>
      </Seccion>

      <Seccion titulo="Selector segmentado">
        <div className="flex flex-col items-start gap-4">
          <Segmentado
            etiqueta="Operación"
            valor={operacion}
            onChange={setOperacion}
            opciones={[
              { valor: "temporario", etiqueta: "Alquilar" },
              { valor: "anual", etiqueta: "Anual" },
              { valor: "venta", etiqueta: "Comprar" },
            ]}
          />
          <Segmentado
            etiqueta="Tipo de propiedad"
            valor={tipo}
            onChange={setTipo}
            opciones={[
              { valor: "casa", etiqueta: "Casa" },
              { valor: "departamento", etiqueta: "Departamento" },
              { valor: "duplex", etiqueta: "Dúplex" },
              { valor: "cabana", etiqueta: "Cabaña" },
              { valor: "lote", etiqueta: "Lote" },
              { valor: "local", etiqueta: "Local" },
            ]}
          />
        </div>
      </Seccion>

      <Seccion titulo="Pastillas">
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => (
            <PastillaFiltro key={a} activa={amenities.includes(a)} onClick={() => alternar(a)}>
              {a}
            </PastillaFiltro>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <PastillaEstado tono="ok" punto>
            Disponible
          </PastillaEstado>
          <PastillaEstado tono="ok">Publicada</PastillaEstado>
          <PastillaEstado>En revisión</PastillaEstado>
          <PastillaEstado>Borrador</PastillaEstado>
          <PastillaEstado tono="error">Rechazada</PastillaEstado>
          <PastillaEstado tono="negro">Destacada</PastillaEstado>
        </div>
      </Seccion>

      <Seccion titulo="Campos">
        <div className="grid max-w-[720px] gap-4 md:grid-cols-2">
          <Campo etiqueta="Nombre" placeholder="Tu nombre" autoComplete="name" />
          <Campo etiqueta="Mail" type="email" placeholder="tu@mail.com" error="Ingresá un mail válido" defaultValue="ana@" />
          <CampoSelect etiqueta="Zona" defaultValue="carilo">
            <option value="pinamar">Pinamar</option>
            <option value="carilo">Cariló</option>
            <option value="valeria">Valeria del Mar</option>
            <option value="ostende">Ostende</option>
            <option value="esmeralda">Costa Esmeralda</option>
          </CampoSelect>
          <Campo etiqueta="Huéspedes" type="number" min={1} defaultValue={4} ayuda="Contando chicos" />
          <CampoArea className="md:col-span-2" etiqueta="Mensaje" placeholder="Hola, quería consultar por AP-0123…" />
        </div>
      </Seccion>

      <Seccion titulo="Cards">
        <div className="grid gap-x-3 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <article>
            <CardFoto>
              <button
                type="button"
                aria-pressed={favorito}
                aria-label={favorito ? "Quitar de favoritos" : "Guardar en favoritos"}
                onClick={() => setFavorito(!favorito)}
                className="vidrio-circulo absolute top-2.5 right-2.5 grid size-[38px] place-items-center rounded-full transition-transform duration-200 ease-app active:scale-90"
              >
                <Icono
                  key={String(favorito)}
                  nombre="corazon"
                  tamano={18}
                  className={favorito ? "animate-pop fill-error text-error" : "text-negro"}
                />
              </button>
              <PastillaEstado tono="negro" className="absolute bottom-2.5 left-2.5">
                Destacada
              </PastillaEstado>
            </CardFoto>
            <div className="mt-3 flex flex-col gap-1.5">
              <Rotulo>Cariló · Casa</Rotulo>
              <h3 className="text-[15px] leading-snug font-medium">Casa en el bosque a 300 m del mar</h3>
              <p className="text-[13px] text-texto-2">6 huéspedes · 3 dormitorios · 2 baños</p>
              <Precio monto={250} moneda="USD" periodo="NOCHE" />
            </div>
          </article>

          <div aria-hidden="true">
            <Esqueleto className="aspect-[4/3] w-full rounded-card" />
            <Esqueleto className="mt-3 h-3 w-24" />
            <Esqueleto className="mt-2 h-4 w-4/5" />
            <Esqueleto className="mt-2 h-3 w-3/5" />
          </div>

          <Card className="self-start">
            <Rotulo>Resumen</Rotulo>
            <p className="mt-2 font-titulo text-[19px] font-semibold tracking-[-0.02em]">2 al 16 de enero</p>
            <p className="mt-1 text-[14px] text-texto-2">14 noches · 5 huéspedes</p>
            <div className="mt-4 flex items-baseline justify-between border-t border-gris-200 pt-4">
              <span className="text-[15px] font-medium">Total</span>
              <Precio monto={4500} moneda="USD" tamano="ficha" />
            </div>
          </Card>
        </div>
      </Seccion>

      <Seccion titulo="Hojas de vidrio">
        <div className="flex flex-wrap gap-3">
          <Boton variante="secundario" onClick={() => setPanel(true)}>
            Abrir panel
          </Boton>
          <Boton variante="secundario" onClick={() => setCartel(true)}>
            Abrir cartel
          </Boton>
        </div>
        <p className="mt-3 max-w-[52ch] text-[13px] text-texto-2">
          El panel sube desde abajo en el celular y entra desde la derecha en la compu. Se cierra con la X, tocando afuera o con Escape.
        </p>
      </Seccion>

      <Seccion titulo="Íconos">
        <div className="flex flex-wrap gap-5 text-negro">
          {ICONOS.map((n) => (
            <Icono key={n} nombre={n} tamano={22} />
          ))}
        </div>
      </Seccion>

      <Hoja
        abierta={panel}
        onCerrar={() => setPanel(false)}
        titulo="Consultar"
        pie={
          <>
            <Boton tamano="grande" ancho onClick={() => setPanel(false)}>
              Enviar consulta
            </Boton>
            <Boton variante="texto" className="self-center text-texto-2" onClick={() => setPanel(false)}>
              Cancelar
            </Boton>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Rotulo>AP-0123 · Cariló · Casa</Rotulo>
          <Campo etiqueta="Nombre" placeholder="Tu nombre" />
          <Campo etiqueta="Mail" type="email" placeholder="tu@mail.com" />
          <Campo etiqueta="Teléfono" type="tel" placeholder="11 5555 5555" />
          <CampoArea etiqueta="Mensaje" defaultValue="Hola, quería consultar por AP-0123 del 2 al 16 de enero para 5 personas." />
        </div>
      </Hoja>

      <Hoja abierta={cartel} onCerrar={() => setCartel(false)} titulo="Consulta enviada" variante="centrada">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="animate-pop grid size-16 place-items-center rounded-full bg-ok/10 text-ok">
            <Icono nombre="check" tamano={30} />
          </span>
          <p className="text-[14px] text-texto-2">Te van a responder por mail o WhatsApp.</p>
          <Boton ancho onClick={() => setCartel(false)}>
            Listo
          </Boton>
        </div>
      </Hoja>
    </main>
  );
}
