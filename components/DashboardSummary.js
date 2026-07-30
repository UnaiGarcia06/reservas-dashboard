export default function DashboardSummary({ reservasHoy, proximaReserva }) {
  const totalReservas = reservasHoy.length;
  const totalPersonas = reservasHoy.reduce((suma, r) => {
    const p = Number(r.personas);
    return suma + (Number.isFinite(p) ? p : 0);
  }, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-paper-50 border border-paper-200 rounded-card px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-ink-500 font-mono mb-1">
          Reservas hoy
        </div>
        <div className="font-display text-2xl text-ink-800">
          {totalReservas}
        </div>
      </div>

      <div className="bg-paper-50 border border-paper-200 rounded-card px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-ink-500 font-mono mb-1">
          Comensales hoy
        </div>
        <div className="font-display text-2xl text-ink-800">
          {totalPersonas || "—"}
        </div>
      </div>

      <div className="bg-paper-50 border border-paper-200 rounded-card px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-ink-500 font-mono mb-1">
          Próxima reserva
        </div>
        <div className="font-display text-2xl text-ink-800">
          {proximaReserva ? proximaReserva.hora?.slice(0, 5) : "—"}
        </div>
        {proximaReserva && (
          <div className="text-xs text-ink-500 font-mono truncate">
            {proximaReserva.nombre_cliente}
          </div>
        )}
      </div>
    </div>
  );
}