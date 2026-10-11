import type { Metadata } from "next";
import Asistente from "@/components/panel/Asistente";
import { faltaEnLaCuenta } from "@/lib/panel";
import { opcionesDelAsistente } from "@/lib/panel-datos";
import { usuarioActual } from "@/lib/usuarios";
import { VALORES_VACIOS } from "@/lib/valores-propiedad";

export const metadata: Metadata = { title: "Publicar una propiedad" };

export default async function NuevaPropiedadPage() {
  const yo = await usuarioActual();
  if (!yo) return null; // el layout ya redirige
  const [zonas, amenities] = await opcionesDelAsistente();
  return (
    <Asistente
      zonas={zonas}
      amenities={amenities}
      propiedad={null}
      pasoInicial={0}
      faltaCuenta={faltaEnLaCuenta(yo)}
      // El WhatsApp de la cuenta viene cargado de entrada
      inicial={{ ...VALORES_VACIOS, zoneId: "", contactWhatsapp: yo.whatsapp ?? yo.phone ?? "" }}
    />
  );
}
