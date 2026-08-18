const PIXELES_POR_MINUTO = 1.4;

function horaAMinutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default function AgendaCalendario({ empleados, citas, franja, esHoy }) {
  const inicioMin = horaAMinutos(franja.inicio);
  const finMin = horaAMinutos(franja.fin);
  const alturaTotal = (finMin - inicioMin) * PIXELES_POR_MINUTO;

  const horasMarcadas = [];
  for (let m = Math.ceil(inicioMin / 60) * 60; m <= finMin; m += 60) {
    horasMarcadas.push(m);
  }

  const citasPorEmpleado = {};
  for (const c of citas) {
    const ids =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];
    for (const id of ids) {
      citasPorEmpleado[id] = citasPorEmpleado[id] || [];
      citasPorEmpleado[id].push(c);
    }
  }

  const ahora = new Date();
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
  const mostrarLineaHora = esHoy && minutosAhora >= inicioMin && minutosAhora <= finMin;
  const topLineaHora = (minutosAhora - inicioMin) * PIXELES_POR_MINUTO;

  if (empleados.length === 0) {
    return (
      <div className="border border-dashed border-surface-border rounded-card p-10 text-center">
        <p className="text-sm text-ink-muted">No hay empleados activos configurados.</p>
      </div>
    );
  }

  return (
    <div className="flex border border-surface-border rounded-card overflow-hidden bg-surface-card shadow-card">
      {/* Columna de horas */}
      <div className="w-14 shrink-0 border-r border-surface-border relative pt-9">
        <div style={{ height: alturaTotal, position: "relative" }}>
          {horasMarcadas.map((m) => (
            <div
              key={m}
              className="absolute left-0 right-0 text-[10px] text-ink-muted font-mono -translate-y-1/2 pr-2 text-right"
              style={{ top: (m - inicioMin) * PIXELES_POR_MINUTO }}
            >
              {minutosAHora(m)}
            </div>
          ))}
        </div>
      </div>

      {/* Columnas de empleados */}
      <div className="flex-1 flex">
        {empleados.map((empleado) => (
          <div
            key={empleado.id}
            className="flex-1 border-r border-surface-border last:border-0"
          >
            <div className="h-9 flex items-center justify-center bg-surface border-b border-surface-border">
              <span className="text-sm font-semibold text-ink">{empleado.nombre}</span>
            </div>
            <div className="relative" style={{ height: alturaTotal }}>
              {horasMarcadas.map((m) => (
                <div
                  key={m}
                  className="absolute left-0 right-0 border-t border-surface-border"
                  style={{ top: (m - inicioMin) * PIXELES_POR_MINUTO }}
                />
              ))}

              {(citasPorEmpleado[empleado.id] || []).map((c) => {
                const inicioCitaMin = horaAMinutos(c.hora?.slice(0, 5));
                const top = (inicioCitaMin - inicioMin) * PIXELES_POR_MINUTO;
                const altura = Math.max(
                  c.duracion_minutos * PIXELES_POR_MINUTO - 2,
                  20
                );
                return (
                  <div
                    key={c.id}
                    className="absolute left-1 right-1 rounded-btn border px-2 py-1 overflow-hidden"
                    style={{
                      top,
                      height: altura,
                      backgroundColor: `${empleado.color}33`,
                      borderColor: empleado.color,
                    }}
                  >
                    <div className="text-[10px] font-mono text-ink-muted">
                      {c.hora?.slice(0, 5)}–{minutosAHora(inicioCitaMin + c.duracion_minutos)}
                    </div>
                    <div className="text-xs font-semibold text-ink truncate">
                      {c.nombre_cliente}
                    </div>
                    {c.servicio_nombre && (
                      <div className="text-[11px] text-ink-muted truncate">
                        {c.servicio_nombre}
                      </div>
                    )}
                  </div>
                );
              })}

              {mostrarLineaHora && (
                <div
                  className="absolute left-0 right-0 h-px bg-status-occupied z-20"
                  style={{ top: topLineaHora }}
                >
                  <span className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-status-occupied" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}