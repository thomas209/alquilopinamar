// Datos estructurados para buscadores (schema.org). Se escapa "<" para que
// ningun texto cargado (titulo, descripcion) pueda cerrar el <script>.
export default function JsonLd({ datos }: { datos: object | object[] }) {
  const json = JSON.stringify(datos).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
