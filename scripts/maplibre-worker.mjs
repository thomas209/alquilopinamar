// Copia el worker de MapLibre a public/vendor/ con la version en el nombre.
// MapLibre 6 busca su worker al lado de su propio archivo, y el bundler de Next
// lo mueve; por eso se sirve aparte y se indica con setWorkerUrl (components/mapa).
// Corre solo en postinstall, dev y build. public/vendor/ no se sube a git.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const raiz = join(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(raiz, "node_modules/maplibre-gl/package.json"), "utf8"));
const destino = join(raiz, "public/vendor");
const nombre = "maplibre-gl-worker-" + pkg.version + ".mjs";

mkdirSync(destino, { recursive: true });
for (const f of readdirSync(destino)) if (f.startsWith("maplibre-gl-worker-") && f !== nombre) rmSync(join(destino, f));
copyFileSync(join(raiz, "node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs"), join(destino, nombre));
console.log("MapLibre: worker " + pkg.version + " listo en public/vendor/");
