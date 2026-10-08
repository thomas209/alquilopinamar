import Boton from "@/components/ui/Boton";
import { Card } from "@/components/ui/Card";
import Rotulo from "@/components/ui/Rotulo";
import { PaginaTexto } from "@/components/site/PaginaTexto";
import { metadataDePagina } from "@/lib/seo";
import { zonasActivas } from "@/lib/sitio";

export const metadata = metadataDePagina({
  titulo: "Quiénes somos",
  descripcion: "AlquiloPinamar es un sitio dedicado solo al Partido de Pinamar: alquiler temporario, alquiler anual y venta, con fotos reales, precios claros y contacto directo.",
  ruta: "/nosotros",
});

const PILARES = [
  { titulo: "Fotos reales", texto: "Cada publicación muestra la propiedad como es, en buena calidad y con varias fotos. Sin renders ni fotos de otra casa." },
  { titulo: "Precios claros", texto: "El precio se ve en la ficha, en dólares o en pesos, con las tarifas por temporada cuando las hay. Sin sorpresas al consultar." },
  { titulo: "Contacto directo", texto: "Consultás por WhatsApp o con un formulario y te responde quien publica. Publicar y consultar no tiene costo." },
];

export default async function NosotrosPage() {
  const zonas = await zonasActivas();
  return (
    <PaginaTexto
      rotulo="Quiénes somos"
      titulo="Todo Pinamar y alrededores, en un solo lugar."
      bajada="AlquiloPinamar es un sitio dedicado exclusivamente al Partido de Pinamar. Juntamos alquileres temporarios, alquileres anuales y propiedades en venta para que encontrar tu lugar en la costa sea simple."
    >
      <div className="grid gap-3 md:grid-cols-3 md:gap-4">
        {PILARES.map((p) => (
          <Card key={p.titulo}>
            <h2 className="font-titulo text-[19px] font-semibold tracking-[-0.02em]">{p.titulo}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-texto-2">{p.texto}</p>
          </Card>
        ))}
      </div>

      <section className="mt-14">
        <Rotulo como="p">Dónde estamos</Rotulo>
        <p className="mt-3 text-[17px] leading-relaxed">
          Trabajamos en {zonas.map((z) => z.name).join(", ").replace(/, ([^,]*)$/, " y $1")}. Cada zona tiene su página con las propiedades disponibles.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {zonas.map((z) => (
            <Boton key={z.slug} href={"/zonas/" + z.slug} variante="secundario" tamano="chico">
              {z.name}
            </Boton>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-hoja bg-negro p-6 text-blanco md:p-10">
        <Rotulo como="p" tono="claro">
          Para propietarios
        </Rotulo>
        <h2 className="mt-3 font-titulo text-[26px] leading-tight font-semibold tracking-[-0.02em] md:text-[32px]">¿Tenés una propiedad en la zona?</h2>
        <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed text-blanco/75">Publicarla es gratis. Escribinos y te ayudamos a cargarla con buenas fotos y toda la información que buscan los interesados.</p>
        <Boton href="/contacto#publicar" variante="inverso" className="mt-6">
          Quiero publicar
        </Boton>
      </section>
    </PaginaTexto>
  );
}
