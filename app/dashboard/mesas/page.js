import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import { obtenerTurnos } from "@/lib/turnosPorNegocio";
import { turnoDeHora } from "@/lib/turnos";
import FloorPlan from "@/components/FloorPlan";
import CapacityBar from "@/components/CapacityBar";
import FiltroFecha from "@/components/FiltroFecha";
import TabsTurno from "@/components/TabsTurno";

function formatearFechaLarga(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function horaActualHHMM() {
  const ahora = new Date();
  return `${String(ahora.getHours()).padStart(2, "0")}:${String(
    ahora.getMinutes()
  ).padStart(2, "0")}`;
}

export default async function MesasPage({ searchParams }) {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);

  const modo = negocio?.config_capacidad?.modo ?? null;
  const turnos = await obtenerTurnos(negocioId);
  const usaTurnos = modo === "turno" && turnos.length > 0;

  const hoy = new Date().toISOString().slice(0, 10);
  const fecha = searchParams?.fecha || hoy;

  const turnoDefecto = usaTurnos
    ? fecha === hoy
      ? turnoDeHora(horaActualHHMM(), turnos) || turnos[0].nombre
      : turnos[0].nombre
    : null;

  const turnoActivo = usaTurnos
    ? searchParams?.turno && turnos.some((t) => t.nombre === searchParams.turno)
      ? searchParams.turno
      : turnoDefecto
    : null;

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, zona, capacidad")
    .eq("negocio_id", negocioId)
    .eq("activo", true);

  const { data: citas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, hora, detalles, recurso_id, recurso_ids")
    .eq("negocio_id", negocioId)
    .eq("fecha", fecha)
    .neq("estado", "Cancelada");

  const citasDelTurno = usaTurnos
    ? (citas || []).filter((c) => turnoDeHora(c.hora, turnos) === turnoActivo)
    : citas || [];

  const mapaOcupacion = {};
  for (const c of citasDelTurno) {
    const ids =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];
    for (const id of ids) {
      mapaOcupacion[id] = c;
    }
  }

  const zonasMap = {};
  for (const r of recursos || []) {
    const nombreZona = r.zona || "General";
    zonasMap[nombreZona] = zonasMap[nombreZona] || [];
    const reserva = mapaOcupacion[r.id] || null;
    zonasMap[nombreZona].push({
      id: r.id,
      nombre: r.nombre,
      capacidad: r.capacidad,
      ocupada: !!reserva,
      reserva,
    });
  }
  const zonas = Object.entries(zonasMap).map(([nombre, mesas]) => ({ nombre, mesas }));

  const capacidadTotal = (recursos || []).reduce((sum, r) => sum + (r.capacidad || 0), 0);
  const reservadosPax = citasDelTurno.reduce(
    (sum, c) => sum + (Number(c.detalles?.personas) || 0),
    0
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Ocupación y Mesas</h1>
      <p className="text-ink-muted text-sm mb-4">{formatearFechaLarga(fecha)}</p>

      <div className="flex gap-6 items-start mt-4">
        <div className="flex-1">
          <FloorPlan zonas={zonas} />
        </div>

        <div className="w-72 bg-surface-card border border-surface-border rounded-card p-4 shrink-0">
          <h3 className="text-sm font-semibold text-ink mb-3">
            Gestión Dinámica de Capacidad
          </h3>
          <FiltroFecha fecha={fecha} turno={turnoActivo} />

          {usaTurnos && (
            <div className="mt-3">
              <TabsTurno turnos={turnos} turnoActivo={turnoActivo} fecha={fecha} />
            </div>
          )}

          <div className="mt-4">
            <CapacityBar reservados={reservadosPax} capacidadTotal={capacidadTotal} />
          </div>
        </div>
      </div>
    </div>
  );
}