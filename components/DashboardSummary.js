export default function DashboardSummary({ reservasHoy, proximaReserva }) {
  const totalReservas = reservasHoy.length;
  const totalPersonas = reservasHoy.reduce((suma, r) => {
    const p = Number(r.personas);
    return suma + (Number.isFinite(p) ? p : 0);
  }, 0);

  return (
    <div className="grid grid-cols-3 gap-3 mb-8">
      <div className="bg-paper-0 border border-paper-200 rounded-card px-4 py-3.5 shadow-card hover:shadow-card-hover transition-shadow">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-mono mb-1.5">
          Reservas hoy
        </div>
        <div className="font-display text-[26px] leading-none text-ink-800">
          {totalReservas}
        </div>
      </div>

      <div className="bg-paper-0 border border-paper-200 rounded-card px-4 py-3.5 shadow-card hover:shadow-card-hover transition-shadow">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-mono mb-1.5">
          Comensales hoy
        </div>
        <div className="font-display text-[26px] leading-none text-ink-800">
          {totalPersonas || "—"}
        </div>
      </div>

      <div className="bg-paper-0 border border-paper-200 border-l-2 border-l-stamp-amber rounded-card px-4 py-3.5 shadow-card hover:shadow-card-hover transition-shadow">
        <div className="text-[11px] uppercase tracking-wider text-ink-500 font-mono mb-1.5">
          Próxima reserva
        </div>
        <div className="font-display text-[26px] leading-none text-ink-800">
          {proximaReserva ? proximaReserva.hora?.slice(0, 5) : "—"}
        </div>
        {proximaReserva && (
          <div className="text-xs text-ink-500 font-mono truncate mt-1">
            {proximaReserva.nombre_cliente}
          </div>
        )}
      </div>
    </div>
  );
}