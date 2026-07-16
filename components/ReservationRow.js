import StatusStamp from "./StatusStamp";

export default function ReservationRow({ reserva }) {
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
    </div>
  );
}
