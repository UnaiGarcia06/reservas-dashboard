import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import SeccionEmpleados from "@/components/ajustes/SeccionEmpleados";
import SeccionServicios from "@/components/ajustes/SeccionServicios";

export default async function AjustesPage() {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);

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

      {/* Nombre del negocio */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3">
        <h2 className="text-lg font-medium text-ink">Datos generales</h2>
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
            Nombre del negocio
          </label>
          <input
            type="text"
            readOnly
            value={negocio?.nombre || "Peluqueria"}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink cursor-not-allowed"
          />
        </div>
      </div>

      {/* Tipos de servicio (Corte, Tinte, etc.) */}
      <SeccionServicios servicios={servicios || []} negocioId={negocioId} />

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
    </div>
  );
}