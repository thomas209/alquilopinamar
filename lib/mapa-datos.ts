// Datos de los mapas, compartidos por servidor y navegador.
export const TILES = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
export const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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
