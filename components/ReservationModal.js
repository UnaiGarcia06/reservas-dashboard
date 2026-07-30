"use client";

import { useState } from "react";
import { crearReserva, actualizarReserva } from "@/lib/actions/reservas";
import { useToast } from "@/components/ToastProvider";
import Button from "@/components/Button";

const inputClass =
  "w-full border border-paper-300 rounded-btn px-3 py-2 text-sm mt-1 text-ink-800 bg-paper-0 focus:outline-none focus:ring-1 focus:ring-ink-600 focus:border-ink-600 transition-colors";

const labelClass = "text-[11px] uppercase tracking-wider text-ink-500 font-mono";

export default function ReservationModal({
  modo,
  recursos,
  reserva = null,
  trigger,
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const { mostrarToast } = useToast();

  const esEdicion = !!reserva;

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
        <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-paper-0 rounded-panel border border-paper-200 w-full max-w-md p-6 shadow-elevated">
            <h2 className="font-display text-xl mb-5 text-ink-800">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    defaultValue={reserva?.fecha || ""}
                    required
                    className={inputClass}
                  />
                </div>

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
              </div>

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

              {modo === "slot" && (
                <div>
                  <label className={labelClass}>Recurso</label>
                  <select
                    name="recurso_id"
                    defaultValue={reserva?.recurso_id || ""}
                    className={inputClass}
                  >
                    <option value="">Sin asignar</option>
                    {(recursos || []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-stamp-clay">{error}</p>}

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