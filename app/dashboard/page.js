import { Fragment } from "react";
import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import ReservationRow from "@/components/ReservationRow";
import ReservationModal from "@/components/ReservationModal";
import GroupLabel from "@/components/GroupLabel";
import DashboardSummary from "@/components/DashboardSummary";
import Button from "@/components/Button";
import { agruparPorTurno } from "@/lib/turnos";

function agruparPorFecha(reservas) {
  const grupos = {};
  for (const r of reservas) {
    grupos[r.fecha] = grupos[r.fecha] || [];
    grupos[r.fecha].push(r);
  }
  return grupos;
}

function agruparPorRecurso(reservas, recursos) {
  const grupos = {};
  const orden = (recursos || []).map((rec) => rec.nombre);

  for (const r of reservas) {
    const nombre = r.recurso_nombre || "Sin recurso asignado";
    grupos[nombre] = grupos[nombre] || [];
    grupos[nombre].push(r);
  }

  const clavesOrdenadas = [
    ...orden.filter((nombre) => grupos[nombre]),
    ...Object.keys(grupos).filter((nombre) => !orden.includes(nombre)),
  ];

  return clavesOrdenadas.map((nombre) => ({ nombre, reservas: grupos[nombre] }));
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

  const { negocioId, negocio } = await getNegocioActual(supabase);

  const modo = negocio?.config_capacidad?.modo ?? null;
  const turnos = negocio?.config_capacidad?.turnos ?? [];

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre")
    .eq("negocio_id", negocioId)
    .eq("activo", true);

  const recursosMap = {};
  for (const rec of recursos || []) {
    recursosMap[rec.id] = rec.nombre;
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const { data: reservas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, telefono, fecha, hora, estado, detalles, recurso_id")
    .eq("negocio_id", negocioId)
    .neq("estado", "Cancelada")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  const reservasFormateadas = (reservas || []).map((r) => ({
    ...r,
    personas: r.detalles?.personas ?? "—",
    recurso_nombre: r.recurso_id ? recursosMap[r.recurso_id] : null,
  }));

  const reservasHoy = reservasFormateadas.filter((r) => r.fecha === hoy);
  const proximaReserva = reservasFormateadas[0] ?? null;

  const gruposPorFecha = agruparPorFecha(reservasFormateadas);
  const fechas = Object.keys(gruposPorFecha).sort();

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display text-2xl text-ink-800">Próximas reservas</h1>
        <ReservationModal
          modo={modo}
          recursos={recursos}
          trigger={<Button>+ Nueva reserva</Button>}
        />
      </div>
      <p className="text-ink-500 text-sm mb-6">
        Reservas confirmadas o pendientes desde hoy.
      </p>

      <DashboardSummary reservasHoy={reservasHoy} proximaReserva={proximaReserva} />

      {fechas.length === 0 ? (
        <div className="border border-dashed border-paper-300 rounded-panel p-10 text-center">
          <p className="text-sm text-ink-500">
            No hay reservas próximas todavía. En cuanto entre una, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {fechas.map((fecha) => {
            const reservasDelDia = gruposPorFecha[fecha];

            let subgrupos = null;
            if (modo === "turno") {
              subgrupos = agruparPorTurno(reservasDelDia, turnos);
            } else if (modo === "slot") {
              subgrupos = agruparPorRecurso(reservasDelDia, recursos);
            }

            return (
              <div key={fecha}>
                <h2 className="text-[11px] uppercase tracking-wider text-ink-500 font-mono mb-1.5">
                  {formatearFecha(fecha)}
                </h2>
                <div className="bg-paper-0 rounded-panel border border-paper-200 shadow-card px-3">
                  {subgrupos
                    ? subgrupos.map((grupo) => (
                        <Fragment key={grupo.nombre}>
                          <GroupLabel>{grupo.nombre}</GroupLabel>
                          {grupo.reservas.map((reserva) => (
                            <ReservationRow key={reserva.id} reserva={reserva} modo={modo} recursos={recursos} />
                          ))}
                        </Fragment>
                      ))
                    : reservasDelDia.map((reserva) => (
                        <ReservationRow key={reserva.id} reserva={reserva} modo={modo} recursos={recursos} />
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}