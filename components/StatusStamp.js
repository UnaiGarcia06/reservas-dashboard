const STYLES = {
  Confirmada: {
    color: "text-stamp-amber",
    border: "border-stamp-amber",
    bg: "bg-stamp-amber-soft",
    label: "Confirmada",
    rotate: "rotate-[-3deg]",
  },
  Pendiente: {
    color: "text-stamp-slate",
    border: "border-stamp-slate",
    bg: "bg-stamp-slate-soft",
    label: "Pendiente",
    rotate: "rotate-[2deg]",
  },
  Cancelada: {
    color: "text-stamp-clay",
    border: "border-stamp-clay",
    bg: "bg-stamp-clay-soft",
    label: "Cancelada",
    rotate: "rotate-[-2deg]",
  },
};

export default function StatusStamp({ estado }) {
  const s = STYLES[estado] || STYLES.Pendiente;

  return (
    <span
      className={`inline-flex items-center justify-center border ${s.border} ${s.color} ${s.bg} ${s.rotate} rounded-stamp px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0`}
    >
      {s.label}
    </span>
  );
}