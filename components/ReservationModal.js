"use client";

import { useState } from "react";
import { crearReserva, actualizarReserva } from "@/lib/actions/reservas";

export default function ReservationModal({
  modo,
  recursos,
  reserva = null,
  trigger,
}) {
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

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
      return;
    }

    setAbierto(false);
  }

  return (
    <>
      <span onClick={() => setAbierto(true)}>{trigger}</span>

      {abierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-paper-200 w-full max-w-md p-6">
            <h2 className="font-display text-xl mb-4">
              {esEdicion ? "Editar reserva" : "Nueva reserva"}
            </h2>

            <form action={manejarSubmit} className="space-y-3">
              <div>
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Nombre
                </label>
                <input
                  name="nombre_cliente"
                  defaultValue={reserva?.nombre_cliente || ""}
                  required
                  className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Teléfono
                </label>
                <input
                  name="telefono"
                  defaultValue={reserva?.telefono || ""}
                  required
                  className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    defaultValue={reserva?.fecha || ""}
                    required
                    className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                    Hora
                  </label>
                  <input
                    type="time"
                    name="hora"
                    defaultValue={reserva?.hora || ""}
                    required
                    className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Personas
                </label>
                <input
                  type="number"
                  name="personas"
                  min="1"
                  defaultValue={reserva?.personas || ""}
                  className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>

              {modo === "slot" && (
                <div>
                  <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                    Recurso
                  </label>
                  <select
                    name="recurso_id"
                    defaultValue={reserva?.recurso_id || ""}
                    className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
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

              {error && (
                <p className="text-sm text-stamp-red">{error}</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className="flex-1 bg-ink-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
                >
                  {enviando ? "Guardando..." : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  className="px-4 py-2 text-sm text-ink-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
