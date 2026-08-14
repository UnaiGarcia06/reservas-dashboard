export default function CapacityBar({ reservados, capacidadTotal }) {
  const porcentaje =
    capacidadTotal > 0 ? Math.min(100, Math.round((reservados / capacidadTotal) * 100)) : 0;

  const colorBarra =
    porcentaje >= 85
      ? "bg-status-occupied"
      : porcentaje >= 50
      ? "bg-status-pending"
      : "bg-status-confirmed";

  return (
    <div>
      <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${colorBarra} transition-all duration-300`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <p className="text-xs text-ink-muted">
        Reservados: <span className="font-medium text-ink">{reservados} pax</span>
        {" · "}
        Capacidad Total: <span className="font-medium text-ink">{capacidadTotal} pax</span>
      </p>
    </div>
  );
}