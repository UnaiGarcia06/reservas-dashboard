import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import SeccionEmpleados from "@/components/ajustes/SeccionEmpleados";
import SeccionTiposServicio from "@/components/ajustes/SeccionTiposServicio";
import SeccionNombreNegocio from "@/components/ajustes/SeccionNombreNegocio";

export default async function AjustesPage() {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);
  const modo = negocio?.config_capacidad?.modo ?? "slot";

  const [{ data: recursos }, { data: servicios }] = await Promise.all([
    supabase
      .from("recursos")
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
          Configura los datos del negocio, personal, recursos físicos y servicios.
        </p>
      </div>

      <SeccionNombreNegocio negocio={negocio} />

      {/* Sección 1: Empleados */}
      <SeccionEmpleados
        items={recursos || []}
        titulo="Empleados / Personal"
        placeholder="Nombre del estilista/profesional..."
        tipo="empleado"
      />

      {/* Sección 2: Tocadores / Sillas / Equipamiento */}
      <SeccionEmpleados
        items={recursos || []}
        titulo="Recursos Físicos (Sillas / Tocadores)"
        placeholder="Ej: Silla 1, Tocador Principal..."
        tipo="silla"
      />

      {/* Sección 3: Servicios */}
      <SeccionTiposServicio servicios={servicios || []} />
    </div>
  );
}