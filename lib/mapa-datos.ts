// Datos de los mapas, compartidos por servidor y navegador.
// Estilo del mapa: OpenFreeMap "Positron" (gratis, sin clave ni limite; trae su atribucion).
export const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/positron";

// Centro aproximado de cada zona (para arrancar el mapa del admin)
export const CENTRO_ZONA: Record<string, [number, number]> = {
  pinamar: [-37.1092, -56.8607],
  carilo: [-37.1655, -56.9055],
  "valeria-del-mar": [-37.1436, -56.8856],
  ostende: [-37.1315, -56.8774],
  "costa-esmeralda": [-37.0383, -56.7798],
};
export const CENTRO_PARTIDO: [number, number] = [-37.11, -56.86];

// Radio del circulo de "zona aproximada" en la ficha (metros)
export const RADIO_APROXIMADO = 350;
