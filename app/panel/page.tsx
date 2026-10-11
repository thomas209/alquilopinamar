import { redirect } from "next/navigation";

// Por ahora el panel arranca en "Mis propiedades".
export default function PanelPage() {
  redirect("/panel/propiedades");
}
