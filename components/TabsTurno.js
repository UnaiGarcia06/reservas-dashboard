import Link from "next/link";

export default function TabsTurno({ turnos, turnoActivo, fecha }) {
  return (
    <div className="flex gap-2">
      {turnos.map((turno) => (
        <Link
          key={turno.nombre}
          href={`?fecha=${fecha}&turno=${turno.nombre}`}
          className={`px-4 py-1.5 rounded-btn text-sm font-medium border transition-colors ${
            turnoActivo === turno.nombre
              ? "bg-brand text-white border-brand"
              : "bg-surface-card text-ink border-surface-border hover:border-brand"
          }`}
        >
          {turno.nombre}
        </Link>
      ))}
    </div>
  );
}