// Llamada a un endpoint propio desde el navegador. Nunca tira error:
// devuelve { ok, datos } o { ok: false, error } con el mensaje para mostrar.
export async function pedir<T = unknown>(
  url: string,
  metodo: "POST" | "PATCH" | "PUT" | "DELETE",
  cuerpo?: unknown,
): Promise<{ ok: true; datos: T } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, {
      method: metodo,
      headers: cuerpo === undefined ? undefined : { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
    const datos = await res.json().catch(() => null);
    if (!res.ok) {
      const mensaje = datos && typeof datos.error === "string" ? datos.error : "Algo salió mal. Probá de nuevo.";
      return { ok: false, error: mensaje };
    }
    return { ok: true, datos: datos as T };
  } catch {
    return { ok: false, error: "No hay conexión. Probá de nuevo." };
  }
}
