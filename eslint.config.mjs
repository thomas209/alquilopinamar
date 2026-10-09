import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Copia de solo lectura del codigo de Member: no se revisa ni se importa.
    "referencia-member/**",
    "backups/**",
    // Worker de MapLibre copiado de node_modules (scripts/maplibre-worker.mjs).
    "public/vendor/**",
  ]),
]);

export default eslintConfig;
