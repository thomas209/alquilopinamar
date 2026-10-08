import Boton from "@/components/ui/Boton";
import Rotulo from "@/components/ui/Rotulo";

// Contenido de la pagina 404 (se usa con y sin el header del sitio).
export default function NoEncontrada() {
  return (
    <div className="mx-auto flex min-h-[60svh] max-w-[1440px] flex-col justify-center px-4 py-20 md:px-12">
      <Rotulo como="p">Error 404</Rotulo>
      <h1 className="mt-4 max-w-[18ch] font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">Esta página no existe o ya no está publicada.</h1>
      <p className="mt-4 max-w-[48ch] text-[16px] text-texto-2">Puede que la propiedad se haya alquilado o vendido. Mirá las que están disponibles ahora.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Boton href="/propiedades">Ver propiedades</Boton>
        <Boton href="/" variante="secundario">
          Ir al inicio
        </Boton>
      </div>
    </div>
  );
}
