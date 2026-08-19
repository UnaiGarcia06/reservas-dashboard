"use client";

import { useState } from "react";
import { actualizarCalendarioExcepciones } from "@/lib/actions/negocio";

const DIAS_SEMANA = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" },
];

export default function SeccionCalendarioRestaurante({ negocioId, configInicial }) {
  const [diasCerrados, setDiasCerrados] = useState(
    configInicial?.dias_semanales_cerrados || []
  );
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [tipoExcepcion, setTipoExcepcion] = useState("cerrado"); // "cerrado" u "abierto"
  const [fechasEspeciales, setFechasEspeciales] = useState(
    configInicial?.fechas_especiales || []
  );
  const [guardando, setGuardando] = useState(false);

  const toggleDiaSemana = (diaId) => {
    if (diasCerrados.includes(diaId)) {
      setDiasCerrados(diasCerrados.filter((d) => d !== diaId));
    } else {
      setDiasCerrados([...diasCerrados, diaId]);
    }
  };

  const agregarFechaEspecial = (e) => {
    e.preventDefault();
    if (!nuevaFecha) return;

    const existe = fechasEspeciales.some((f) => f.fecha === nuevaFecha);
    if (existe) return;

    const nuevasFechas = [
      ...fechasEspeciales,
      { fecha: nuevaFecha, cerrado: tipoExcepcion === "cerrado" },
    ];
    setFechasEspeciales(nuevasFechas);
    setNuevaFecha("");
  };

  const eliminarFechaEspecial = (fechaAEliminar) => {
    setFechasEspeciales(
      fechasEspeciales.filter((f) => f.fecha !== fechaAEliminar)
    );
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarCalendarioExcepciones(negocioId, {
        dias_semanales_cerrados: diasCerrados,
        fechas_especiales: fechasEspeciales,
      });
      alert("Calendario guardado correctamente");
    } catch (err) {
      alert("Error al guardar el calendario");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">Días de Cierre y Excepciones</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Configura los días que el restaurante permanece cerrado de forma habitual o en fechas festivas.
          </p>
        </div>
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-accent/90 disabled:opacity-50"
        >
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* Días habituales de descanso */}
      <div>
        <label className="block text-xs font-semibold text-ink-muted uppercase mb-2">
          Días habituales de cierre semanal
        </label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((dia) => {
            const estaCerrado = diasCerrados.includes(dia.id);
            return (
              <button
                key={dia.id}
                type="button"
                onClick={() => toggleDiaSemana(dia.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  estaCerrado
                    ? "bg-red-500 text-white border-red-600"
                    : "bg-surface text-ink border-border hover:bg-border/30"
                }`}
              >
                {dia.label} {estaCerrado ? "(Cerrado)" : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fechas festivas / aperturas especiales */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <label className="block text-xs font-semibold text-ink-muted uppercase">
          Excepciones por fechas concretas (Festivos / Cierres por vacaciones / Aperturas de fiesta)
        </label>

        <form onSubmit={agregarFechaEspecial} className="flex gap-2">
          <input
            type="date"
            value={nuevaFecha}
            onChange={(e) => setNuevaFecha(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg outline-none focus:border-accent"
          />
          <select
            value={tipoExcepcion}
            onChange={(e) => setTipoExcepcion(e.target.value)}
            className="px-3 py-1.5 text-sm border border-border rounded-lg outline-none focus:border-accent bg-white"
          >
            <option value="cerrado">Cerrar este día</option>
            <option value="abierto">Abrir este día (Excepción de descanso)</option>
          </select>
          <button
            type="submit"
            disabled={!nuevaFecha}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            Añadir Fecha
          </button>
        </form>

        <div className="space-y-1.5 pt-2">
          {fechasEspeciales.map((item) => (
            <div
              key={item.fecha}
              className="flex items-center justify-between p-2.5 bg-surface rounded-lg border border-border/50 text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-ink-muted">{item.fecha}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.cerrado
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {item.cerrado ? "Cerrado completo" : "Apertura especial"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => eliminarFechaEspecial(item.fecha)}
                className="text-xs text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          ))}

          {fechasEspeciales.length === 0 && (
            <p className="text-xs text-ink-muted italic">No hay excepciones de fechas programadas.</p>
          )}
        </div>
      </div>
    </div>
  );
}