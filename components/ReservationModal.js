"use client";

import { useState, useMemo } from "react";
import { crearReserva, actualizarReserva } from "@/lib/actions/reservas";
import { useToast } from "@/components/ToastProvider";
import Button from "@/components/Button";
import { turnoDeHora } from "@/lib/turnos";
import { mesasOcupadasEnFechaHora } from "@/lib/disponibilidad";

const inputClass =
  "w-full border border-surface-border rounded-btn px-3 py-2 text-sm mt-1 text-ink bg-surface-card focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

const labelClass = "text-[11px] uppercase tracking-wider text-ink-muted font-mono";

function BotonOpcion({ activo, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 text-sm px-3 py-2 rounded-btn border transition-colors ${
        activo
          ? "bg-brand text-white border-brand"
          : "bg-surface-card text-ink border-surface-border hover:border-brand"
      }`}
    >
      {children}
    </button>
  );
}

export default function ReservationModal({
  modo,
  recursos,
  turnos = [],
  todasReservas = [],
  reserva = null,
  trigger,
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const { mostrarToast } = useToast();

  const esEdicion = !!reserva;
  const usaTurnos = turnos && turnos.length > 0;

  const mesasAsignadasInicial = (
    reserva?.recurso_ids && reserva.recurso_ids.length > 0
      ? reserva.recurso_ids
      : reserva?.recurso_id
      ? [reserva.recurso_id]
      : []
  ).map(String);

  const zonaInicial = (() => {
    if (mesasAsignadasInicial.length === 0) return null;
    const primeraMesa = recursos?.find((r) => String(r.id) === mesasAsignadasInicial[0]);
    return primeraMesa?.zona || null;
  })();

  const turnoInicial = reserva?.hora ? turnoDeHora(reserva.hora, turnos) : null;

  const [fecha, setFecha] = useState(reserva?.fecha || "");
  const [hora, setHora] = useState(reserva?.hora?.slice(0, 5) || "");
  const [turnoActivo, setTurnoActivo] = useState(turnoInicial);
  const [zonaActiva, setZonaActiva] = useState(zonaInicial);

  const zonas = useMemo(() => {
    const set = new Set((recursos || []).map((r) => r.zona || "General"));
    return Array.from(set);
  }, [recursos]);

  const turnoSeleccionado = turnos.find((t) => t.nombre === turnoActivo) || null;

  const mesasDisponibles = useMemo(() => {
    if (!zonaActiva) return [];

    const ocupadas = mesasOcupadasEnFechaHora({
      citas: todasReservas,
      fecha,
      hora,
      excluirId: reserva?.id,
    });

    return (recursos || []).filter((r) => {
      const zona = r.zona || "General";
      if (zona !== zonaActiva) return false;
      return !ocupadas.has(r.id);
    });
  }, [recursos, zonaActiva, fecha, hora, todasReservas, reserva]);

  function manejarClicTurno(turno) {
    setTurnoActivo(turno.nombre);
    setHora(turno.inicio.slice(0, 5));
  }

  async function manejarSubmit(formData) {
    setEnviando(true);
    setError(null);

    const resultado = esEdicion
      ? await actualizarReserva(reserva.id, formData)
      : await crearReserva(formData);

    setEnviando(false);

    if (resultado?.error) {
      setError(resultado.error);
      mostrarToast(resultado.error, "error");
      return;
    }

    mostrarToast(esEdicion ? "Reserva actualizada." : "Reserva creada.", "exito");
    setAbierto(false);
  }

  return (
    <>
      <span onClick={() => setAbierto(true)}>{trigger}</span>

      {abierto && (
        <div className="fixed inset-0 bg-sidebar/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card rounded-panel border border-surface-border w-full max-w-md p-6 shadow-elevated max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-5 text-ink">
              {esEdicion ? "Editar reserva" : "Nueva reserva"}
            </h2>

            <form action={manejarSubmit} className="space-y-3.5">
              <div>
                <label className={labelClass}>Nombre</label>
                <input
                  name="nombre_cliente"
                  defaultValue={reserva?.nombre_cliente || ""}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Teléfono</label>
                <input
                  name="telefono"
                  defaultValue={reserva?.telefono || ""}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              {usaTurnos ? (
                <>
                  <div>
                    <label className={labelClass}>Turno</label>
                    <div className="flex gap-2 mt-1">
                      {turnos.map((turno) => (
                        <BotonOpcion
                          key={turno.nombre}
                          activo={turnoActivo === turno.nombre}
                          onClick={() => manejarClicTurno(turno)}
                        >
                          {turno.nombre}
                        </BotonOpcion>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Hora</label>
                    <input
                      type="hidden"
                      name="hora"
                      value={hora ? `${hora}:00` : ""}
                      required
                    />
                    <input
                      type="time"
                      value={hora}
                      onChange={(e) => setHora(e.target.value)}
                      disabled={!turnoSeleccionado}
                      min={turnoSeleccionado?.inicio?.slice(0, 5)}
                      max={turnoSeleccionado?.fin?.slice(0, 5)}
                      className={inputClass}
                    />
                    {!turnoSeleccionado && (
                      <p className="text-xs text-ink-muted mt-1">
                        Elige primero un turno.
                      </p>
                    )}
                  </div>

                  {zonas.length > 1 && (
                    <div>
                      <label className={labelClass}>Zona</label>
                      <div className="flex gap-2 mt-1">
                        {zonas.map((zona) => (
                          <BotonOpcion
                            key={zona}
                            activo={zonaActiva === zona}
                            onClick={() => setZonaActiva(zona)}
                          >
                            {zona}
                          </BotonOpcion>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className={labelClass}>Hora</label>
                  <input
                    type="time"
                    name="hora"
                    defaultValue={reserva?.hora || ""}
                    required
                    className={inputClass}
                  />
                </div>
              )}

              <div>
                <label className={labelClass}>Personas</label>
                <input
                  type="number"
                  name="personas"
                  min="1"
                  defaultValue={reserva?.personas || ""}
                  className={inputClass}
                />
              </div>

              {recursos && recursos.length > 0 && (usaTurnos ? zonaActiva : true) && (
                <div>
                  <label className={labelClass}>
                    Mesas (Ctrl/Cmd + clic para varias)
                  </label>
                  {usaTurnos && !hora ? (
                    <p className="text-xs text-ink-muted mt-1">
                      Elige turno y hora para ver las mesas libres.
                    </p>
                  ) : (
                    <select
                      key={zonaActiva || "sin-zona"}
                      name="recurso_ids"
                      multiple
                      defaultValue={mesasAsignadasInicial}
                      className={`${inputClass} h-32`}
                    >
                      {mesasDisponibles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre} ({r.capacidad}p)
                        </option>
                      ))}
                    </select>
                  )}
                  {usaTurnos && zonaActiva && hora && mesasDisponibles.length === 0 && (
                    <p className="text-xs text-status-occupied mt-1">
                      No quedan mesas libres en {zonaActiva} a esa hora.
                    </p>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-status-occupied">{error}</p>}

              <div className="flex gap-2 pt-3">
                <Button type="submit" disabled={enviando} className="flex-1">
                  {enviando ? "Guardando…" : "Guardar"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAbierto(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}