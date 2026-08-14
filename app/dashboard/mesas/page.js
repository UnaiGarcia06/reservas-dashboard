import { obtenerMesasConEstado } from "@/lib/actions/mesas";
import FloorPlan from "@/components/FloorPlan";
import CapacityBar from "@/components/CapacityBar";

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function MesasPage({ searchParams }) {
  const fecha = searchParams?.fecha || hoyISO();

  const { zonas, reservados, capacidadTotal } = await obtenerMesasConEstado(fecha);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-semibold text-ink">Ocupación y Mesas</h1>
      </div>
      <p className="text-ink-muted text-sm mb-6 capitalize">
        {formatearFecha(fecha)}
      </p>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        <div className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
          {zonas.length === 0 ? (
            <div className="border border-dashed border-surface-border rounded-card p-10 text-center">
              <p className="text-sm text-ink-muted">
                Aún no hay mesas configuradas para este negocio.
              </p>
            </div>
          ) : (
            <FloorPlan zonas={zonas} />
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-surface-card rounded-card border border-surface-border shadow-card p-4">
            <h2 className="text-sm font-semibold text-ink mb-3">
              Gestión Dinámica de Capacidad
            </h2>

            <form method="GET" className="mb-4">
              <label className="text-[11px] uppercase tracking-wider text-ink-muted font-mono block mb-1">
                Fecha de negocio
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  name="fecha"
                  defaultValue={fecha}
                  className="flex-1 border border-surface-border rounded-btn px-3 py-1.5 text-sm text-ink bg-surface-card focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                />
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-btn bg-brand text-white hover:bg-brand-hover transition-colors"
                >
                  Ver
                </button>
              </div>
            </form>

            <CapacityBar reservados={reservados} capacidadTotal={capacidadTotal} />
          </div>
        </div>
      </div>
    </div>
  );
}