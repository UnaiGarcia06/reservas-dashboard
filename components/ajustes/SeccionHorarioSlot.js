"use client";

import { useState } from "react";
import {
  actualizarCalendarioExcepciones,
  actualizarHorarioSlot,
} from "@/lib/actions/negocio";

const DIAS_SEMANA = [
  { id: 1, label: "Lunes", key: "lunes" },
  { id: 2, label: "Martes", key: "martes" },
  { id: 3, label: "Miércoles", key: "miercoles" },
  { id: 4, label: "Jueves", key: "jueves" },
  { id: 5, label: "Viernes", key: "viernes" },
  { id: 6, label: "Sábado", key: "sabado" },
  { id: 0, label: "Domingo", key: "domingo" },
];

function construirHorarioInicial(horarioInicial) {
  const inicial = {};
  DIAS_SEMANA.forEach((dia) => {
    const datosDia = horarioInicial?.[dia.key];
    if (datosDia && typeof datosDia === "object" && Array.isArray(datosDia.franjas)) {
      inicial[dia.key] = {
        abierto: !!datosDia.abierto,
        franjas: datosDia.franjas.map(([ini, fin]) => [ini || "", fin || ""]),
      };
    } else {
      inicial[dia.key] = { abierto: false, franjas: [] };
    }
  });
  return inicial;
}

export default function SeccionHorarioSlot({
  negocioId,
  configInicial,
  horarioInicial,
}) {
  // Ya no se edita desde aquí, pero lo conservamos tal cual estaba guardado
  // para no perder ese dato al guardar (por si se usa en otro sitio).
  const diasCerradosGuardados = configInicial?.dias_semanales_cerrados || [];
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [tipoExcepcion, setTipoExcepcion] = useState("cerrado"); // "cerrado" u "abierto"
  const [fechasEspeciales, setFechasEspeciales] = useState(
    configInicial?.fechas_especiales || []
  );
  const [horarioPorDia, setHorarioPorDia] = useState(
    construirHorarioInicial(horarioInicial)
  );
  const [guardando, setGuardando] = useState(false);

  const toggleAbiertoDia = (diaKey) => {
    setHorarioPorDia((prev) => {
      const actual = prev[diaKey];
      const nuevoAbierto = !actual.abierto;
      return {
        ...prev,
        [diaKey]: {
          abierto: nuevoAbierto,
          franjas:
            nuevoAbierto && actual.franjas.length === 0
              ? [["09:00", "13:00"]]
              : actual.franjas,
        },
      };
    });
  };

  const agregarFranja = (diaKey) => {
    setHorarioPorDia((prev) => ({
      ...prev,
      [diaKey]: {
        ...prev[diaKey],
        franjas: [...prev[diaKey].franjas, ["16:00", "20:00"]],
      },
    }));
  };

  const actualizarFranja = (diaKey, idx, campo, valor) => {
    setHorarioPorDia((prev) => {
      const franjas = prev[diaKey].franjas.map((f, i) =>
        i === idx ? (campo === "inicio" ? [valor, f[1]] : [f[0], valor]) : f
      );
      return { ...prev, [diaKey]: { ...prev[diaKey], franjas } };
    });
  };

  const eliminarFranja = (diaKey, idx) => {
    setHorarioPorDia((prev) => ({
      ...prev,
      [diaKey]: {
        ...prev[diaKey],
        franjas: prev[diaKey].franjas.filter((_, i) => i !== idx),
      },
    }));
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

  const construirHorarioFinal = () => {
    const horarioFinal = {};
    DIAS_SEMANA.forEach((dia) => {
      const config = horarioPorDia[dia.key];
      const franjasValidas = (config?.franjas || []).filter((f) => f[0] && f[1]);
      horarioFinal[dia.key] = {
        abierto: !!config?.abierto && franjasValidas.length > 0,
        franjas: franjasValidas,
      };
    });
    return horarioFinal;
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const horarioFinal = construirHorarioFinal();
      const [resExcepciones, resHorario] = await Promise.all([
        actualizarCalendarioExcepciones(negocioId, {
          dias_semanales_cerrados: diasCerradosGuardados,
          fechas_especiales: fechasEspeciales,
        }),
        actualizarHorarioSlot(negocioId, horarioFinal),
      ]);

      if (resExcepciones?.error || resHorario?.error) {
        alert(
          "Error al guardar: " + (resExcepciones?.error || resHorario?.error)
        );
        return;
      }

      alert("Horario guardado correctamente");
    } catch (err) {
      alert("Error al guardar el horario");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">Horario y Días de Cierre</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Configura las horas en las que aceptas reservas cada día y los cierres habituales o festivos.
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

      {/* Horario semanal por franjas (permite horario partido) */}
      <div>
        <label className="block text-xs font-semibold text-ink-muted uppercase mb-2">
          Horario semanal
        </label>
        <p className="text-xs text-ink-muted mb-3">
          Marca los días que abres y añade una o varias franjas horarias. Útil para horario
          partido, como mañanas y tardes por separado. Los días que dejes en "Cerrado" no
          admitirán reservas.
        </p>
        <div className="space-y-3">
          {DIAS_SEMANA.map((dia) => {
            const configDia = horarioPorDia[dia.key] || { abierto: false, franjas: [] };

            return (
              <div
                key={dia.id}
                className="flex flex-col sm:flex-row sm:items-start gap-2 py-2 border-b border-border/40 last:border-0"
              >
                <span className="text-xs font-medium text-ink w-20 shrink-0 pt-1.5">
                  {dia.label}
                </span>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleAbiertoDia(dia.key)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                      configDia.abierto
                        ? "bg-emerald-500 text-white border-emerald-600"
                        : "bg-surface text-ink-muted border-border hover:bg-border/30"
                    }`}
                  >
                    {configDia.abierto ? "Abierto" : "Cerrado"}
                  </button>

                  {configDia.abierto && (
                    <div className="space-y-1.5">
                      {configDia.franjas.map((franja, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={franja[0]}
                            onChange={(e) =>
                              actualizarFranja(dia.key, idx, "inicio", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-border rounded-lg outline-none focus:border-accent"
                          />
                          <span className="text-xs text-ink-muted">a</span>
                          <input
                            type="time"
                            value={franja[1]}
                            onChange={(e) =>
                              actualizarFranja(dia.key, idx, "fin", e.target.value)
                            }
                            className="px-2 py-1 text-sm border border-border rounded-lg outline-none focus:border-accent"
                          />
                          <button
                            type="button"
                            onClick={() => eliminarFranja(dia.key, idx)}
                            className="text-xs text-red-500 hover:underline ml-1"
                          >
                            Quitar
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => agregarFranja(dia.key)}
                        className="text-xs text-ink-muted underline hover:text-ink"
                      >
                        + Añadir franja horaria
                      </button>
                    </div>
                  )}
                </div>
              </div>
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