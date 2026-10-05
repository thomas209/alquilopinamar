// Login del ADMIN (backoffice): usuario y contraseña con NextAuth.
// Los usuarios y propietarios del sitio usan otro sistema aparte (link magico, Fase 2).
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 }, // 12 horas
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin || !admin.isActive) return null;

        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok) return null;

        await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
        return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = token.role ?? "EDITOR";
      return session;
    },
  },
};

// Admin con sesion iniciada, o null. Para Server Components y endpoints.
export async function adminActual() {
  const session = await getServerSession(authOptions);
  return session?.user?.id ? session.user : null;
}

// Para los endpoints de /api/admin: devuelve una respuesta 401 si no hay sesion.
// El proxy (proxy.ts) ya corta antes, pero cada endpoint lo vuelve a verificar por las dudas.
export async function exigirAdmin(): Promise<NextResponse | null> {
  const admin = await adminActual();
  return admin ? null : NextResponse.json({ error: "No autorizado" }, { status: 401 });
}
