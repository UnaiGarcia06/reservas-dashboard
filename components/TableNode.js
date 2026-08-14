export default function TableNode({ mesa }) {
  const ocupada = mesa.ocupada;

  return (
    <div
      className={`w-full aspect-square rounded-card border-2 flex flex-col items-center justify-center gap-0.5 p-1.5 text-center ${
        ocupada
          ? "bg-status-occupied-soft border-status-occupied"
          : "bg-status-confirmed-soft border-status-confirmed"
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          ocupada ? "bg-status-occupied" : "bg-status-confirmed"
        }`}
      />
      <span className="text-xs font-medium text-ink">{mesa.nombre}</span>
      <span className="text-[10px] text-ink-muted font-mono">{mesa.capacidad}p</span>

      {ocupada && mesa.reserva && (
        <div className="mt-0.5 leading-tight">
          <div className="text-[10px] font-semibold text-ink truncate max-w-full">
            {mesa.reserva.nombre_cliente}
          </div>
          <div className="text-[9px] text-ink-muted">
            {mesa.reserva.detalles?.personas ?? "?"}pax
            {mesa.reserva.hora ? ` · ${mesa.reserva.hora.slice(0, 5)}` : ""}
          </div>
        </div>
      )}
    </div>
  );
}