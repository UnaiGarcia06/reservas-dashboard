import Link from "next/link";

export default function TabsTurno({ turnos, turnoActivo, fecha }) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-ink-muted font-mono">
        Turno
      </label>
      <div className="flex gap-2 mt-1">
        {turnos.map((turno) => (
          <Link
            key={turno.nombre}
            href={`?fecha=${fecha}&turno=${turno.nombre}`}
            className={`flex-1 text-center px-3 py-1.5 rounded-btn text-sm font-medium border transition-colors ${
              turnoActivo === turno.nombre
                ? "bg-brand text-white border-brand"
                : "bg-surface-card text-ink border-surface-border hover:border-brand"
            }`}
          >
            {turno.nombre}
          </Link>
        ))}
      </div>
    </div>
  );
}