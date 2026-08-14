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
    <tr className="border-b border-surface-border last:border-0 hover:bg-surface transition-colors">
      <td className="px-3 py-2.5 font-mono text-sm text-ink">{reserva.hora}</td>

      <td className="px-3 py-2.5 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{reserva.nombre_cliente}</div>
        <div className="text-xs text-ink-muted font-mono">{reserva.telefono}</div>
      </td>

      <td className="px-3 py-2.5 text-sm font-mono text-ink text-right">
        {reserva.personas}
      </td>

      <td className="px-3 py-2.5 text-sm text-ink-muted">
        {reserva.recurso_nombres || "—"}
      </td>

      <td className="px-3 py-2.5">
        <StatusStamp estado={reserva.estado} />
      </td>

      <td className="px-3 py-2.5">
        <div className="flex items-center justify-end gap-1">
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
      </td>
    </tr>
  );
}