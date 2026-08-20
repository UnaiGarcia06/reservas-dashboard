import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import { obtenerTurnos } from "@/lib/turnosPorNegocio";
import AjustesForm from "@/components/AjustesForm";
import SeccionEmpleados from "@/components/ajustes/SeccionEmpleados";
import SeccionServicios from "@/components/ajustes/SeccionServicios";
import SeccionCalendarioRestaurante from "@/components/ajustes/SeccionCalendarioRestaurante";

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
      modo === "slot"
        ? supabase
            .from("tipos_servicio")
            .select("*")
            .eq("negocio_id", negocioId)
            .order("nombre", { ascending: true })
        : Promise.resolve({ data: [] }),
    ]);

  return (
    <div className="max-w-6xl space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Ajustes del negocio</h1>
        <p className="text-ink-muted text-sm mt-1">
          {modo === "slot"
            ? "Configura los datos del negocio, personal, recursos físicos y servicios."
            : "Datos generales, turnos, zonas, mesas, personal y días de cierre."}
        </p>
      </div>

      {/* Grid de 2 columnas en escritorio, 1 columna en móvil.
          items-start evita que las tarjetas se estiren a la altura de la más alta de su fila. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {modo === "slot" ? (
          /* VISTA PARA PELUQUERÍAS / SERVICIOS POR SLOT */
          <>
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-3">
              <h2 className="text-lg font-medium text-ink">Datos generales</h2>
              <div>
                <label className="block text-xs font-semibold text-ink-muted uppercase mb-1">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  readOnly
                  value={negocio?.nombre || ""}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface text-ink cursor-not-allowed"
                />
              </div>
            </div>

            <SeccionServicios servicios={servicios || []} negocioId={negocioId} />

            <SeccionEmpleados
              items={recursos || []}
              titulo="Empleados / Personal"
              placeholder="Nombre del estilista/profesional..."
              tipo="empleado"
            />

            <SeccionEmpleados
              items={recursos || []}
              titulo="Recursos Físicos (Sillas / Tocadores)"
              placeholder="Ej: Silla 1, Tocador Principal..."
              tipo="silla"
            />
          </>
        ) : (
          /* VISTA PARA RESTAURANTES / NEGOCIOS POR TURNO */
          <>
            <AjustesForm
              negocio={negocio}
              turnos={turnos}
              zonas={zonas || []}
              recursos={(recursos || []).filter(
                (r) => (r.tipo ?? "mesa") !== "empleado"
              )}
            />

            <SeccionEmpleados
              items={recursos || []}
              titulo="Empleados / Personal"
              placeholder="Nombre del empleado..."
              tipo="empleado"
            />

            {/* Módulo intuitivo de gestión de días de cierre/excepciones */}
            <SeccionCalendarioRestaurante
              negocioId={negocioId}
              configInicial={negocio?.calendarios_excepciones}
              horarioInicial={negocio?.horario}
              turnos={turnos}
            />
          </>
        )}
      </div>
    </div>
  );
}