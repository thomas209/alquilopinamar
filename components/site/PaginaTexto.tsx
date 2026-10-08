import Rotulo from "@/components/ui/Rotulo";

// Marco de las paginas de texto (quienes somos, terminos, privacidad):
// titulo grande y columna de lectura comoda.
export function PaginaTexto({ rotulo, titulo, bajada, children }: { rotulo: string; titulo: string; bajada?: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-[1440px] px-4 pt-10 pb-8 md:px-12 md:pt-16">
      <header className="max-w-[760px]">
        <Rotulo como="p">{rotulo}</Rotulo>
        <h1 className="mt-4 font-titulo text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[52px]">{titulo}</h1>
        {bajada && <div className="mt-5 text-[17px] leading-relaxed text-texto-2 md:text-[19px]">{bajada}</div>}
      </header>
      <div className="mt-10 max-w-[68ch] md:mt-14">{children}</div>
    </article>
  );
}

// Seccion numerada de un texto legal
export function Clausula({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-gris-200 py-8 first:border-t-0 first:pt-0">
      <h2 className="font-titulo text-[20px] font-medium tracking-[-0.02em] md:text-[22px]">{titulo}</h2>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed [&_a]:text-link [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>
    </section>
  );
}
