import { Fragment } from "react";
import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import ReservationRow from "@/components/ReservationRow";
import ReservationModal from "@/components/ReservationModal";
import GroupLabel from "@/components/GroupLabel";
import DashboardSummary from "@/components/DashboardSummary";
import Button from "@/components/Button";
import FiltroFecha from "@/components/FiltroFecha";
import AgendaCalendario from "@/components/AgendaCalendario";
import { agruparPorTurno } from "@/lib/turnos";
import { obtenerTurnos } from "@/lib/turnosPorNegocio";
import { obtenerFranjaDelDia } from "@/lib/horario";

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
    const nombre = r.recurso_nombres || "Sin recurso asignado";
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

export default async function DashboardPage({ searchParams }) {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);
  const modo = negocio?.config_capacidad?.modo ?? null;

  // ---------- Modo "slot" (peluquería, spa, clínica...) ----------
  if (modo === "slot") {
    const hoy = new Date().toISOString().slice(0, 10);
    const fecha = searchParams?.fecha || hoy;

    const { data: empleados } = await supabase
      .from("recursos")
      .select("id, nombre, color, activo")
      .eq("negocio_id", negocioId)
      .eq("tipo", "empleado")
      .eq("activo", true)
      .order("nombre", { ascending: true });

    const { data: servicios } = await supabase
      .from("tipos_servicio")
      .select("id, nombre, duracion_minutos, precio, activo")
      .eq("negocio_id", negocioId)
      .eq("activo", true)
      .order("nombre", { ascending: true });

    const { data: citas } = await supabase
      .from("citas")
      .select(
        "id, nombre_cliente, telefono, hora, estado, tipo_servicio_id, recurso_id, recurso_ids, duracion_minutos"
      )
      .eq("negocio_id", negocioId)
      .eq("fecha", fecha)
      .neq("estado", "Cancelada");

    const mapaServicios = {};
    for (const s of servicios || []) mapaServicios[s.id] = s.nombre;

    const citasFormateadas = (citas || []).map((c) => ({
      ...c,
      servicio_nombre: mapaServicios[c.tipo_servicio_id] || null,
    }));

    const franja = obtenerFranjaDelDia(negocio?.horario, fecha);

    return (
      <div>
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-2xl font-semibold text-ink">Calendario de Reservas</h1>
          <ReservationModal
            modo={modo}
            recursos={empleados || []}
            trigger={<Button>+ Nueva reserva</Button>}
          />
        </div>
        <p className="text-ink-muted text-sm mb-4 capitalize">{formatearFecha(fecha)}</p>

        <div className="mb-4 max-w-xs">
          <FiltroFecha fecha={fecha} />
        </div>

        {franja ? (
          <AgendaCalendario
            empleados={empleados || []}
            citas={citasFormateadas}
            franja={franja}
            esHoy={fecha === hoy}
          />
        ) : (
          <div className="border border-dashed border-surface-border rounded-card p-10 text-center">
            <p className="text-sm text-ink-muted">El negocio está cerrado este día.</p>
          </div>
        )}
      </div>
    );
  }

  // ---------- Modo "turno" (restaurante) ----------
  const turnos = await obtenerTurnos(negocioId);

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, zona, capacidad")
    .eq("negocio_id", negocioId)
    .eq("activo", true);

  const recursosMap = {};
  for (const rec of recursos || []) {
    recursosMap[rec.id] = rec.nombre;
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const { data: reservas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, telefono, fecha, hora, estado, detalles, recurso_id, recurso_ids, duracion_minutos")
    .eq("negocio_id", negocioId)
    .neq("estado", "Cancelada")
    .gte("fecha", hoy)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  const reservasFormateadas = (reservas || []).map((r) => {
    const ids =
      r.recurso_ids && r.recurso_ids.length > 0
        ? r.recurso_ids
        : r.recurso_id
        ? [r.recurso_id]
        : [];

    const nombres = ids.map((id) => recursosMap[id]).filter(Boolean);

    return {
      ...r,
      personas: r.detalles?.personas ?? "—",
      recurso_nombres: nombres.length > 0 ? nombres.join(", ") : null,
    };
  });

  const reservasHoy = reservasFormateadas.filter((r) => r.fecha === hoy);
  const proximaReserva = reservasFormateadas[0] ?? null;

  const gruposPorFecha = agruparPorFecha(reservasFormateadas);
  const fechas = Object.keys(gruposPorFecha).sort();

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-semibold text-ink">Lista de Reservas</h1>
        <ReservationModal
          modo={modo}
          recursos={recursos}
          turnos={turnos}
          todasReservas={reservasFormateadas}
          trigger={<Button>+ Nueva reserva</Button>}
        />
      </div>
      <p className="text-ink-muted text-sm mb-6">
        Reservas confirmadas o pendientes desde hoy.
      </p>

      <DashboardSummary reservasHoy={reservasHoy} proximaReserva={proximaReserva} />

      {fechas.length === 0 ? (
        <div className="border border-dashed border-surface-border rounded-card p-10 text-center">
          <p className="text-sm text-ink-muted">
            No hay reservas próximas todavía. En cuanto entre una, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
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
                <h2 className="text-sm font-semibold text-ink mb-2 capitalize">
                  {formatearFecha(fecha)}
                </h2>
                <div className="bg-surface-card rounded-card border border-surface-border shadow-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-border bg-surface text-left text-[11px] uppercase tracking-wide text-ink-muted">
                        <th className="px-4 py-2.5 font-medium w-16">Hora</th>
                        <th className="px-4 py-2.5 font-medium">Cliente</th>
                        <th className="px-4 py-2.5 font-medium w-20 text-right">Nº Pax</th>
                        <th className="px-4 py-2.5 font-medium w-36">Mesa/Zona</th>
                        <th className="px-4 py-2.5 font-medium w-28">Estado</th>
                        <th className="px-4 py-2.5 font-medium w-48 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subgrupos
                        ? subgrupos.map((grupo) => (
                            <Fragment key={grupo.nombre}>
                              <tr>
                                <td colSpan={6} className="px-4 pt-3 pb-1 bg-surface-card">
                                  <GroupLabel>{grupo.nombre}</GroupLabel>
                                </td>
                              </tr>
                              {grupo.reservas.map((reserva) => (
                                <ReservationRow
                                  key={reserva.id}
                                  reserva={reserva}
                                  modo={modo}
                                  recursos={recursos}
                                  turnos={turnos}
                                  todasReservas={reservasFormateadas}
                                />
                              ))}
                            </Fragment>
                          ))
                        : reservasDelDia.map((reserva) => (
                            <ReservationRow
                              key={reserva.id}
                              reserva={reserva}
                              modo={modo}
                              recursos={recursos}
                              turnos={turnos}
                              todasReservas={reservasFormateadas}
                            />
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}