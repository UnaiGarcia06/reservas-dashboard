export default function GroupLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-1.5 mt-4 first:mt-0">
      <span className="w-1 h-1 rounded-full bg-brand shrink-0" />
      <span className="text-[11px] uppercase tracking-wider font-mono text-ink">
        {children}
      </span>
      <span className="flex-1 h-px bg-surface-border" />
    </div>
  );
}