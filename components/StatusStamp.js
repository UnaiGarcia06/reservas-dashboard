const STYLES = {
  Confirmada: {
    color: "text-status-confirmed",
    bg: "bg-status-confirmed-soft",
    label: "Confirmada",
  },
  Pendiente: {
    color: "text-status-pending",
    bg: "bg-status-pending-soft",
    label: "Pendiente",
  },
  Cancelada: {
    color: "text-status-occupied",
    bg: "bg-status-occupied-soft",
    label: "Cancelada",
  },
};

export default function StatusStamp({ estado }) {
  const s = STYLES[estado] || STYLES.Pendiente;

  return (
    <span
      className={`inline-flex items-center justify-center ${s.color} ${s.bg} rounded-full px-2.5 py-0.5 text-[11px] font-medium shrink-0`}
    >
      {s.label}
    </span>
  );
}