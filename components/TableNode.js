export default function TableNode({ mesa }) {
  const ocupada = mesa.ocupada;

  return (
    <div className="group relative flex flex-col items-center">
      <div
        className={`w-full aspect-square rounded-card border-2 flex flex-col items-center justify-center gap-0.5 transition-colors cursor-default ${
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
      </div>

      {ocupada && mesa.reserva && (
        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10 whitespace-nowrap">
          <div className="bg-sidebar text-white text-xs rounded-btn px-3 py-2 shadow-elevated">
            <div className="font-medium">Reserva activa</div>
            <div className="text-sidebar-text">
              {mesa.reserva.nombre_cliente} ({mesa.reserva.detalles?.personas ?? "?"}pax)
              {mesa.reserva.hora ? ` · ${mesa.reserva.hora.slice(0, 5)}` : ""}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}