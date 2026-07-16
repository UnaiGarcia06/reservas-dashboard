"use client";

import { useState } from "react";
import StatusStamp from "./StatusStamp";
import ReservationModal from "./ReservationModal";
import { cancelarReserva } from "@/lib/actions/reservas";

export default function ReservationRow({ reserva, modo, recursos }) {
  const [cancelando, setCancelando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function manejarCancelar() {
    setCancelando(true);
    await cancelarReserva(reserva.id);
    setCancelando(false);
    setConfirmando(false);
  }

  return (
    <div className="flex items-center gap-4 py-3 px-1 border-b border-paper-200 last:border-0">
      <div className="font-mono text-sm text-ink-800 w-14 shrink-0">
        {reserva.hora}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{reserva.nombre_cliente}</div>
        <div className="text-xs text-ink-600 font-mono flex items-center gap-2">
          <span>{reserva.telefono}</span>
          {reserva.recurso_nombre && (
            <span className="text-stamp-amber">· {reserva.recurso_nombre}</span>
          )}
        </div>
      </div>

      <div className="text-sm font-mono text-ink-600 w-20 text-right shrink-0">
        {reserva.personas} pers.
      </div>

      <StatusStamp estado={reserva.estado} />

      <div className="flex items-center gap-2 shrink-0">
        <ReservationModal
          modo={modo}
          recursos={recursos}
          reserva={reserva}
          trigger={
            <button className="text-xs text-ink-600 underline cursor-pointer">
              Editar
            </button>
          }
        />

        {confirmando ? (
          <div className="flex items-center gap-1">
            <button
              onClick={manejarCancelar}
              disabled={cancelando}
              className="text-xs text-stamp-red underline cursor-pointer disabled:opacity-50"
            >
              {cancelando ? "..." : "Confirmar"}
            </button>
            <button
              onClick={() => setConfirmando(false)}
              className="text-xs text-ink-600 cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmando(true)}
            className="text-xs text-stamp-red underline cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
