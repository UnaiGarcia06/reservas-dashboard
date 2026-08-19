import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import { obtenerTurnos } from "@/lib/turnosPorNegocio";
import SeccionNombreNegocio from "@/components/ajustes/SeccionNombreNegocio";
import SeccionTurnos from "@/components/ajustes/SeccionTurnos";
import SeccionZonasMesas from "@/components/ajustes/SeccionZonasMesas";
import SeccionEmpleados from "@/components/ajustes/SeccionEmpleados";
import SeccionTiposServicio from "@/components/ajustes/SeccionTiposServicio";

export default async function AjustesPage() {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);
  const modo = negocio?.config_capacidad?.modo ?? "slot";

  const [turnos, { data: recursos }, { data: zonas }, { data: servicios }] =
    await Promise.all([
      modo === "turno" ? obtenerTurnos(negocioId) : Promise.resolve([]),
      supabase
        .from("recursos")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("nombre", { ascending: true }),
      supabase
        .from("zonas")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("nombre", { ascending: true }),
      supabase
        .from("tipos_servicio")
        .select("*")
        .eq("negocio_id", negocioId)
        .order("nombre", { ascending: true }),
    ]);

  return (
    <div className="max-w-2xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Ajustes del negocio</h1>
        <p className="text-ink-muted text-sm mt-1">
          {modo === "slot"
            ? "Configura los datos del negocio, personal y servicios."
            : "Datos generales, turnos, zonas y recursos."}
        </p>
      </div>

      <SeccionNombreNegocio negocio={negocio} />

      {/* Turnos solo para Restaurantes */}
      {modo === "turno" && <SeccionTurnos turnos={turnos} />}

      {/* Muestra Empleados o Mesas según el modo */}
      {modo === "slot" ? (
        <SeccionEmpleados empleados={recursos || []} />
      ) : (
        <SeccionZonasMesas
          zonas={zonas || []}
          recursos={recursos || []}
        />
      )}

      {/* Tipos de servicio */}
      <SeccionTiposServicio servicios={servicios || []} />
    </div>
  );
}