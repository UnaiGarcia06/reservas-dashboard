export default function DashboardLoading() {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="flex items-start justify-between mb-1">
        <div className="h-7 w-48 bg-paper-200 rounded-card" />
        <div className="h-9 w-32 bg-paper-200 rounded-card" />
      </div>
      <div className="h-4 w-64 bg-paper-200 rounded mt-2 mb-6" />

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="h-20 bg-paper-100 border border-paper-200 rounded-card" />
        <div className="h-20 bg-paper-100 border border-paper-200 rounded-card" />
        <div className="h-20 bg-paper-100 border border-paper-200 rounded-card" />
      </div>

      <div className="h-4 w-40 bg-paper-200 rounded mb-1.5" />
      <div className="bg-paper-50 rounded-panel border border-paper-200 px-3 py-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-paper-200 last:border-0"
          >
            <div className="h-4 w-10 bg-paper-200 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 bg-paper-200 rounded" />
              <div className="h-3 w-24 bg-paper-200 rounded" />
            </div>
            <div className="h-3.5 w-12 bg-paper-200 rounded" />
            <div className="h-6 w-20 bg-paper-200 rounded-stamp" />
          </div>
        ))}
      </div>
    </div>
  );
}