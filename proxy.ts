import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION, crearValorSesion, leerValorSesion, OPCIONES_COOKIE } from "@/lib/sesion-firma";

// En Next 16 este archivo se llama "proxy" (antes "middleware"): corre antes de cada pedido.
//  - Backoffice (/admin y /api/admin): sin sesion de admin, las paginas van al
//    login y los endpoints responden 401.
//  - Resto del sitio: si hay sesion de usuario, se renueva (30 dias desde la
//    ultima visita). Asi solo vuelve a pedir el link quien no entro en 30 dias.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (token) return NextResponse.next();
    if (pathname.startsWith("/api/admin")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const res = NextResponse.next();
  const valor = request.cookies.get(COOKIE_SESION)?.value;
  if (valor) {
    const sesion = await leerValorSesion(valor);
    if (!sesion) res.cookies.set(COOKIE_SESION, "", { ...OPCIONES_COOKIE, maxAge: 0 });
    else if (sesion.renovar) res.cookies.set(COOKIE_SESION, await crearValorSesion(sesion.userId), OPCIONES_COOKIE);
  }
  return res;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    // Paginas del sitio (no archivos ni la API publica)
    "/((?!api/|_next/|vendor/|favicon.ico|icon.png|apple-icon.png|opengraph-image|sitemap.xml|robots.txt|llms.txt).*)",
  ],
};
