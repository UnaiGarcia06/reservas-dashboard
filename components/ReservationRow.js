"use client";

import { useState } from "react";
import StatusStamp from "./StatusStamp";
import ReservationModal from "./ReservationModal";
import Button from "./Button";
import { cancelarReserva } from "@/lib/actions/reservas";
import { useToast } from "@/components/ToastProvider";

export default function ReservationRow({ reserva, modo, recursos }) {
  const [cancelando, setCancelando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const { mostrarToast } = useToast();

  async function manejarCancelar() {
    setCancelando(true);
    const resultado = await cancelarReserva(reserva.id);
    setCancelando(false);
    setConfirmando(false);

    if (resultado?.error) {
      mostrarToast(resultado.error, "error");
      return;
    }

    mostrarToast("Reserva cancelada.", "exito");
  }

  return (
    <div className="flex items-center gap-4 py-2.5 px-3 border-b border-paper-200 last:border-0 hover:bg-paper-50 transition-colors rounded-btn">
      <div className="font-mono text-sm text-ink-800 w-14 shrink-0">
        {reserva.hora}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink-800 truncate">{reserva.nombre_cliente}</div>
        <div className="text-xs text-ink-500 font-mono flex items-center gap-2">
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

      <div className="flex items-center gap-1 shrink-0">
        <ReservationModal
          modo={modo}
          recursos={recursos}
          reserva={reserva}
          trigger={
            <Button variant="ghost" size="sm">
              Editar
            </Button>
          }
        />

        {confirmando ? (
          <div className="flex items-center gap-1">
            <Button
              variant="danger"
              size="sm"
              onClick={manejarCancelar}
              disabled={cancelando}
            >
              {cancelando ? "..." : "Confirmar"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmando(false)}>
              No
            </Button>
          </div>
        ) : (
          <Button variant="danger" size="sm" onClick={() => setConfirmando(true)}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}