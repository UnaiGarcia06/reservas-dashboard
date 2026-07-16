export default function GroupLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mb-1.5 mt-4 first:mt-0">
      <span className="text-[11px] uppercase tracking-wider font-mono text-stamp-amber">
        {children}
      </span>
      <span className="flex-1 h-px bg-paper-200" />
    </div>
  );
}
