// Pagina provisoria: confirma que el proyecto base, los tokens y las tres
// tipografias funcionan. La home real (hero + buscador) llega con el design system.
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1440px] flex-col justify-center gap-4 px-4 md:px-12">
      <p className="font-rotulo text-[11px] uppercase tracking-[0.1em] text-texto-2">
        Pinamar · Cariló · Valeria del Mar · Ostende · Costa Esmeralda
      </p>
      <h1 className="font-titulo text-[34px] leading-[1.08] font-semibold tracking-[-0.02em] md:text-[44px]">
        AlquiloPinamar
      </h1>
      <p className="max-w-[46ch] text-[15px] text-texto-2">
        Alquiler temporario, alquiler anual y venta de propiedades. Sitio en construcción.
      </p>
    </main>
  );
}
