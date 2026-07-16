import { createClient } from "@/lib/supabase/server";
import ReservationRow from "@/components/ReservationRow";

function agruparPorFecha(reservas) {
  const grupos = {};
  for (const r of reservas) {
    grupos[r.fecha] = grupos[r.fecha] || [];
    grupos[r.fecha].push(r);
  }
  return grupos;
}

function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO + "T00:00:00");
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarioNegocio } = await supabase
    .from("usuarios_negocio")
    .select("negocio_id")
    .eq("user_id", user?.id)
    .single();

  const hoy = new Date().toISOString().slice(0, 10);

  const { data: reservas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, telefono, fecha, hora, estado, detalles")
    .eq("negocio_id", usuarioNegocio?.negocio_id)
    .neq("estado", "Cancelada")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  const reservasFormateadas = (reservas || []).map((r) => ({
    ...r,
    personas: r.detalles?.personas ?? "—",
  }));

  const grupos = agruparPorFecha(reservasFormateadas);
  const fechas = Object.keys(grupos).sort();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-1">Próximas reservas</h1>
      <p className="text-ink-600 text-sm mb-8">
        Reservas confirmadas o pendientes desde hoy.
      </p>

      {fechas.length === 0 ? (
        <div className="border border-dashed border-paper-200 rounded-lg p-10 text-center">
          <p className="text-sm text-ink-600">
            No hay reservas próximas todavía. En cuanto entre una, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {fechas.map((fecha) => (
            <div key={fecha}>
              <h2 className="text-xs uppercase tracking-wider text-ink-600 font-mono mb-2">
                {formatearFecha(fecha)}
              </h2>
              <div className="bg-white rounded-lg border border-paper-200 px-4">
                {grupos[fecha].map((reserva) => (
                  <ReservationRow key={reserva.id} reserva={reserva} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
