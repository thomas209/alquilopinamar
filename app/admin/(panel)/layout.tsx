import { redirect } from "next/navigation";
import { adminActual } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

// El admin siempre se arma en el momento (nunca en el build ni desde cache).
export const dynamic = "force-dynamic";

// Todas las pantallas del admin (menos el login) pasan por aca:
// si no hay sesion, al login.
export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await adminActual();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-dvh">
      <AdminNav nombre={admin.name} />
      <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8 md:py-10">{children}</main>
    </div>
  );
}
