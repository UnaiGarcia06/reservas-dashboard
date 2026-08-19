import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import { obtenerTurnos } from "@/lib/turnosPorNegocio";
import AjustesForm from "@/components/AjustesForm";
import SeccionEmpleados from "@/components/ajustes/SeccionEmpleados";

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
      modo === "turno"
        ? supabase
            .from("zonas")
            .select("*")
            .eq("negocio_id", negocioId)
            .order("nombre", { ascending: true })
        : Promise.resolve({ data: [] }),
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
            ? "Configura los datos del negocio, personal, recursos físicos y servicios."
            : "Datos generales, turnos, zonas y recursos."}
        </p>
      </div>

      {modo === "slot" ? (
        <>
          {/* Formulario general solo con Nombre y Tipos de Servicio */}
          <AjustesForm
            negocio={negocio}
            turnos={[]}
            zonas={[]}
            recursos={[]}
            servicios={servicios || []}
          />

          {/* Personal / Estilistas */}
          <SeccionEmpleados
            items={recursos || []}
            titulo="Empleados / Personal"
            placeholder="Nombre del estilista/profesional..."
            tipo="empleado"
          />

          {/* Equipamiento / Tocadores / Sillas */}
          <SeccionEmpleados
            items={recursos || []}
            titulo="Recursos Físicos (Sillas / Tocadores)"
            placeholder="Ej: Silla 1, Tocador Principal..."
            tipo="silla"
          />
        </>
      ) : (
        <AjustesForm
          negocio={negocio}
          turnos={turnos}
          zonas={zonas || []}
          recursos={recursos || []}
          servicios={servicios || []}
        />
      )}
    </div>
  );
}