"use client";

import { useState } from "react";
import {
  actualizarCalendarioExcepciones,
  actualizarHorarioTurnos,
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

function construirTurnosIniciales(horarioInicial) {
  const inicial = {};
  DIAS_SEMANA.forEach((dia) => {
    const datosDia = horarioInicial?.[dia.key];
    let abiertos = [];
    if (datosDia && typeof datosDia === "object" && !Array.isArray(datosDia)) {
      abiertos = Object.keys(datosDia);
    }
    inicial[dia.key] = abiertos;
  });
  return inicial;
}

export default function SeccionCalendarioRestaurante({
  negocioId,
  configInicial,
  horarioInicial,
  turnos = [],
}) {
  const [diasCerrados, setDiasCerrados] = useState(
    configInicial?.dias_semanales_cerrados || []
  );
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [tipoExcepcion, setTipoExcepcion] = useState("cerrado"); // "cerrado" u "abierto"
  const [fechasEspeciales, setFechasEspeciales] = useState(
    configInicial?.fechas_especiales || []
  );
  const [turnosPorDia, setTurnosPorDia] = useState(
    construirTurnosIniciales(horarioInicial)
  );
  const [guardando, setGuardando] = useState(false);

  const toggleDiaSemana = (diaId) => {
    if (diasCerrados.includes(diaId)) {
      setDiasCerrados(diasCerrados.filter((d) => d !== diaId));
    } else {
      setDiasCerrados([...diasCerrados, diaId]);
    }
  };

  const toggleTurnoDia = (diaKey, turnoNombre) => {
    const turnoKey = turnoNombre.toLowerCase();
    setTurnosPorDia((prev) => {
      const abiertos = prev[diaKey] || [];
      const yaAbierto = abiertos.includes(turnoKey);
      return {
        ...prev,
        [diaKey]: yaAbierto
          ? abiertos.filter((t) => t !== turnoKey)
          : [...abiertos, turnoKey],
      };
    });
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
      if (diasCerrados.includes(dia.id)) {
        horarioFinal[dia.key] = [];
        return;
      }
      const abiertos = turnosPorDia[dia.key] || [];
      if (abiertos.length === 0) {
        horarioFinal[dia.key] = [];
        return;
      }
      const objTurnos = {};
      abiertos.forEach((turnoKey) => {
        const turno = turnos.find((t) => t.nombre.toLowerCase() === turnoKey);
        if (turno) {
          objTurnos[turnoKey] = [
            (turno.inicio || "").slice(0, 5),
            (turno.fin || "").slice(0, 5),
          ];
        }
      });
      horarioFinal[dia.key] = objTurnos;
    });
    return horarioFinal;
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const horarioFinal = construirHorarioFinal();
      const [resExcepciones, resHorario] = await Promise.all([
        actualizarCalendarioExcepciones(negocioId, {
          dias_semanales_cerrados: diasCerrados,
          fechas_especiales: fechasEspeciales,
        }),
        actualizarHorarioTurnos(negocioId, horarioFinal),
      ]);

      if (resExcepciones?.error || resHorario?.error) {
        alert(
          "Error al guardar: " +
            (resExcepciones?.error || resHorario?.error)
        );
        return;
      }

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
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50"
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

      {/* Cierre parcial por turno (ej: domingo solo comida) */}
      {turnos.length > 0 && (
        <div className="pt-2 border-t border-border/60">
          <label className="block text-xs font-semibold text-ink-muted uppercase mb-2">
            Servicios activos por día (Comida / Cena)
          </label>
          <p className="text-xs text-ink-muted mb-3">
            Marca los turnos que el negocio ofrece cada día. Útil para días con horario reducido, como abrir solo a comidas.
          </p>
          <div className="space-y-1.5">
            {DIAS_SEMANA.map((dia) => {
              const cerradoCompleto = diasCerrados.includes(dia.id);
              return (
                <div key={dia.id} className="flex items-center gap-3 py-1">
                  <span className="text-xs font-medium text-ink w-20 shrink-0">
                    {dia.label}
                  </span>
                  {cerradoCompleto ? (
                    <span className="text-xs text-ink-muted italic">
                      Cerrado todo el día
                    </span>
                  ) : (
                    <div className="flex gap-2 flex-wrap">
                      {turnos.map((turno) => {
                        const turnoKey = turno.nombre.toLowerCase();
                        const abierto = (turnosPorDia[dia.key] || []).includes(
                          turnoKey
                        );
                        return (
                          <button
                            key={turno.id}
                            type="button"
                            onClick={() => toggleTurnoDia(dia.key, turno.nombre)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                              abierto
                                ? "bg-emerald-500 text-white border-emerald-600"
                                : "bg-surface text-ink-muted border-border hover:bg-border/30"
                            }`}
                          >
                            {turno.nombre}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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