// Campos propios que viajan en la sesion del admin.
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: { id: string; email: string; name: string; role: "SUPERADMIN" | "EDITOR" };
  }
  interface User {
    role: "SUPERADMIN" | "EDITOR";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "SUPERADMIN" | "EDITOR";
  }
}
