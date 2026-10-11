import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_SESION, leerCookieSesion } from "@/lib/sesion";

// En Next 16 este archivo se llama "proxy" (antes "middleware"): corre antes de cada pedido.
// Sin sesion: las paginas van al login y los endpoints responden 401.
// - /admin y /api/admin: sesion del admin (NextAuth).
// - /panel y /api/panel: sesion de usuario (link magico). Aca solo se mira la firma
//   de la cookie; cada endpoint vuelve a leer el usuario de la base (bloqueos, dueño).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/panel") || pathname.startsWith("/api/panel")) {
    if (leerCookieSesion(request.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Tu sesión se cerró. Volvé a entrar." }, { status: 401 });
    const login = new URL("/cuenta/ingresar", request.url);
    login.searchParams.set("volver", pathname + search);
    return NextResponse.redirect(login);
  }

  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/panel/:path*", "/api/panel/:path*"],
};
