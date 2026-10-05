import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// En Next 16 este archivo se llama "proxy" (antes "middleware"): corre antes de cada pedido.
// Protege el backoffice: /admin (paginas) y /api/admin (endpoints).
// Sin sesion: las paginas van al login y los endpoints responden 401.
// En la Fase 2 se suma /panel y /api/panel con la cookie de usuario.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", request.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
