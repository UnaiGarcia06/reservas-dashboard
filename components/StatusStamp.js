const STYLES = {
  Confirmada: { color: "text-stamp-amber", border: "border-stamp-amber", label: "Confirmada", rotate: "rotate-[-6deg]" },
  Pendiente: { color: "text-stamp-slate", border: "border-stamp-slate", label: "Pendiente", rotate: "rotate-[4deg]" },
  Cancelada: { color: "text-stamp-clay", border: "border-stamp-clay", label: "Cancelada", rotate: "rotate-[-3deg]" },
};

export default function StatusStamp({ estado }) {
  const s = STYLES[estado] || STYLES.Pendiente;

  return (
    <span
      className={`inline-flex items-center justify-center border ${s.border} ${s.color} ${s.rotate} rounded-stamp px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider shrink-0`}
    >
      {s.label}
    </span>
  );
}
