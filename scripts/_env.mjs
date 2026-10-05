// Utilidades compartidas por los scripts de base de datos.
import fs from "fs";
import readline from "readline";

// Lee un archivo tipo .env y devuelve { CLAVE: valor }. Si no existe, {}.
export function leerEnv(archivo) {
  if (!fs.existsSync(archivo)) return {};
  const out = {};
  for (const linea of fs.readFileSync(archivo, "utf8").split(/\r?\n/)) {
    const m = linea.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let valor = m[2].trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    } else {
      valor = valor.replace(/\s+#.*$/, "");
    }
    out[m[1]] = valor;
  }
  return out;
}

const HOSTS_LOCALES = ["localhost", "127.0.0.1", "::1", "[::1]"];

export function hostDe(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

// true solo si la URL apunta a una base en esta misma maquina.
export function esLocal(url) {
  const host = hostDe(url);
  return host !== null && HOSTS_LOCALES.includes(host);
}

// URL de la base local: sale de .env y se rechaza si no es local.
export function urlLocal() {
  const url = leerEnv(".env").DATABASE_URL;
  if (!url) throw new Error('No encontre DATABASE_URL en ".env". Copia .env.example a .env.');
  if (!esLocal(url)) {
    throw new Error('El DATABASE_URL de ".env" no es local (' + hostDe(url) + "). La URL de produccion va en .env.prod-db.");
  }
  return url;
}

// URL de produccion: sale SOLO de .env.prod-db.
export function urlProduccion() {
  const url = leerEnv(".env.prod-db").PROD_DATABASE_URL;
  if (!url) throw new Error('No encontre PROD_DATABASE_URL en ".env.prod-db" (ver .env.prod-db.example).');
  return url;
}

export function opcionesConexion(url) {
  return esLocal(url) ? { connectionString: url } : { connectionString: url, ssl: { rejectUnauthorized: false } };
}

export function preguntar(texto) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(texto, (r) => { rl.close(); resolve(r.trim()); }));
}
