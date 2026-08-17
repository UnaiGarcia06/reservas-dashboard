"use client";

import { useState } from "react";
import {
  actualizarDatosGenerales,
  actualizarTurnos,
  crearRecurso,
  actualizarRecurso,
  toggleRecursoActivo,
  crearTipoServicio,
  actualizarTipoServicio,
  toggleTipoServicioActivo,
} from "@/lib/actions/negocio";

const inputClass =
  "w-full border border-surface-border rounded-btn px-3 py-2 text-sm mt-1 text-ink bg-surface-card focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-colors";

const labelClass = "text-[11px] uppercase tracking-wider text-ink-muted font-mono";

const botonPrimario =
  "bg-ink text-white rounded-btn px-4 py-2 text-sm disabled:opacity-50 hover:opacity-90 transition-opacity";

const enlaceSutil = "text-xs text-ink-muted underline cursor-pointer hover:text-ink";
const enlacePeligro = "text-xs text-status-occupied underline cursor-pointer hover:opacity-80";

export default function AjustesForm({ negocio, recursos, tiposServicio }) {
  const [nombre, setNombre] = useState(negocio?.nombre || "");
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [mensajeNombre, setMensajeNombre] = useState(null);

  async function manejarGuardarNombre(formData) {
    setGuardandoNombre(true);
    setMensajeNombre(null);
    const resultado = await actualizarDatosGenerales(formData);
    setGuardandoNombre(false);
    setMensajeNombre(resultado?.error ? resultado.error : "Guardado");
  }

  const [turnos, setTurnos] = useState(
    negocio?.config_capacidad?.turnos || []
  );
  const [guardandoTurnos, setGuardandoTurnos] = useState(false);
  const [mensajeTurnos, setMensajeTurnos] = useState(null);

  function actualizarTurnoLocal(index, campo, valor) {
    setTurnos((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [campo]: valor } : t))
    );
  }

  function agregarTurno() {
    setTurnos((prev) => [...prev, { nombre: "", inicio: "", fin: "" }]);
  }

  function quitarTurno(index) {
    setTurnos((prev) => prev.filter((_, i) => i !== index));
  }

  async function manejarGuardarTurnos() {
    setGuardandoTurnos(true);
    setMensajeTurnos(null);
    const resultado = await actualizarTurnos(turnos);
    setGuardandoTurnos(false);
    setMensajeTurnos(resultado?.error ? resultado.error : "Guardado");
  }

  const [nombreNuevoRecurso, setNombreNuevoRecurso] = useState("");
  const [creandoRecurso, setCreandoRecurso] = useState(false);
  const [editandoRecursoId, setEditandoRecursoId] = useState(null);

  const [mensajeRecurso, setMensajeRecurso] = useState(null);
  const [tipoNuevoRecurso, setTipoNuevoRecurso] = useState("");

  async function manejarCrearRecurso(formData) {
    setCreandoRecurso(true);
    setMensajeRecurso(null);
    const resultado = await crearRecurso(formData);
    setCreandoRecurso(false);
    if (resultado?.error) {
      setMensajeRecurso(resultado.error);
    } else {
      setNombreNuevoRecurso("");
      setTipoNuevoRecurso("");
    }
  }

  async function manejarActualizarRecurso(id, formData) {
    const resultado = await actualizarRecurso(id, formData);
    if (!resultado?.error) {
      setEditandoRecursoId(null);
    }
  }

  async function manejarToggleActivo(id, activoActual) {
    await toggleRecursoActivo(id, !activoActual);
  }

  const [nombreNuevoTipo, setNombreNuevoTipo] = useState("");
  const [duracionNuevoTipo, setDuracionNuevoTipo] = useState("");
  const [creandoTipo, setCreandoTipo] = useState(false);
  const [mensajeTipo, setMensajeTipo] = useState(null);
  const [editandoTipoId, setEditandoTipoId] = useState(null);

  async function manejarCrearTipoServicio(formData) {
    setCreandoTipo(true);
    setMensajeTipo(null);
    const resultado = await crearTipoServicio(formData);
    setCreandoTipo(false);
    if (resultado?.error) {
      setMensajeTipo(resultado.error);
    } else {
      setNombreNuevoTipo("");
      setDuracionNuevoTipo("");
    }
  }

  async function manejarActualizarTipoServicio(id, formData) {
    const resultado = await actualizarTipoServicio(id, formData);
    if (!resultado?.error) {
      setEditandoTipoId(null);
    }
  }

  async function manejarToggleTipoActivo(id, activoActual) {
    await toggleTipoServicioActivo(id, !activoActual);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <section className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
        <h2 className="text-base font-semibold text-ink mb-4">Datos generales</h2>
        <form action={manejarGuardarNombre} className="flex items-end gap-3">
          <div className="flex-1">
            <label className={labelClass}>Nombre del negocio</label>
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClass}
            />
          </div>
          <button type="submit" disabled={guardandoNombre} className={botonPrimario}>
            {guardandoNombre ? "..." : "Guardar"}
          </button>
        </form>
        {mensajeNombre && (
          <p className="text-xs text-ink-muted mt-2">{mensajeNombre}</p>
        )}
      </section>

      <section className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
        <h2 className="text-base font-semibold text-ink mb-4">Turnos</h2>
        <div className="space-y-3">
          {turnos.map((turno, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <label className={labelClass}>Nombre</label>
                <input
                  value={turno.nombre}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "nombre", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Inicio</label>
                <input
                  type="time"
                  value={turno.inicio}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "inicio", e.target.value)
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fin</label>
                <input
                  type="time"
                  value={turno.fin}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "fin", e.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <button onClick={() => quitarTurno(index)} className={`${enlacePeligro} pb-2`}>
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button onClick={agregarTurno} className={`${enlaceSutil} mt-3 block`}>
          + Añadir turno
        </button>

        <div className="mt-4">
          <button onClick={manejarGuardarTurnos} disabled={guardandoTurnos} className={botonPrimario}>
            {guardandoTurnos ? "..." : "Guardar turnos"}
          </button>
          {mensajeTurnos && (
            <p className="text-xs text-ink-muted mt-2">{mensajeTurnos}</p>
          )}
        </div>
      </section>

      <section className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
        <h2 className="text-base font-semibold text-ink mb-4">Recursos</h2>
        <div className="space-y-2">
          {recursos.map((recurso) => (
            <div
              key={recurso.id}
              className="flex items-center gap-3 border-b border-surface-border pb-2 last:border-0"
            >
              {editandoRecursoId === recurso.id ? (
                <form
                  action={(formData) =>
                    manejarActualizarRecurso(recurso.id, formData)
                  }
                  className="flex items-center gap-2 flex-1"
                >
                  <input
                    name="nombre"
                    defaultValue={recurso.nombre}
                    className="flex-1 border border-surface-border rounded-btn px-3 py-1 text-sm bg-surface-card text-ink"
                  />
                  <button type="submit" className={enlaceSutil}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoRecursoId(null)}
                    className="text-xs text-ink-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      recurso.activo ? "text-ink" : "text-ink-muted line-through"
                    }`}
                  >
                    {recurso.nombre}
                  </span>
                  <button
                    onClick={() => setEditandoRecursoId(recurso.id)}
                    className={enlaceSutil}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      manejarToggleActivo(recurso.id, recurso.activo)
                    }
                    className={enlacePeligro}
                  >
                    {recurso.activo ? "Desactivar" : "Activar"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <form
          action={manejarCrearRecurso}
          className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border"
        >
          <input
            name="nombre"
            value={nombreNuevoRecurso}
            onChange={(e) => setNombreNuevoRecurso(e.target.value)}
            placeholder="Nombre del recurso"
            className="flex-1 border border-surface-border rounded-btn px-3 py-2 text-sm bg-surface-card text-ink"
          />
          <input
            name="tipo"
            value={tipoNuevoRecurso}
            onChange={(e) => setTipoNuevoRecurso(e.target.value)}
            placeholder="Tipo (ej. silla, sala)"
            className="flex-1 border border-surface-border rounded-btn px-3 py-2 text-sm bg-surface-card text-ink"
          />
          <button type="submit" disabled={creandoRecurso} className={botonPrimario}>
            {creandoRecurso ? "..." : "Añadir"}
          </button>
        </form>
        {mensajeRecurso && (
          <p className="text-xs text-ink-muted mt-2">{mensajeRecurso}</p>
        )}
      </section>

      <section className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
        <h2 className="text-base font-semibold text-ink mb-4">Tipos de servicio</h2>
        <div className="space-y-2">
          {(tiposServicio || []).map((tipo) => (
            <div
              key={tipo.id}
              className="flex items-center gap-3 border-b border-surface-border pb-2 last:border-0"
            >
              {editandoTipoId === tipo.id ? (
                <form
                  action={(formData) =>
                    manejarActualizarTipoServicio(tipo.id, formData)
                  }
                  className="flex items-center gap-2 flex-1"
                >
                  <input
                    name="nombre"
                    defaultValue={tipo.nombre}
                    className="flex-1 border border-surface-border rounded-btn px-3 py-1 text-sm bg-surface-card text-ink"
                  />
                  <input
                    name="duracion_minutos"
                    type="number"
                    defaultValue={tipo.duracion_minutos}
                    className="w-20 border border-surface-border rounded-btn px-3 py-1 text-sm bg-surface-card text-ink"
                  />
                  <button type="submit" className={enlaceSutil}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoTipoId(null)}
                    className="text-xs text-ink-muted cursor-pointer"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      tipo.activo ? "text-ink" : "text-ink-muted line-through"
                    }`}
                  >
                    {tipo.nombre} · {tipo.duracion_minutos} min
                  </span>
                  <button
                    onClick={() => setEditandoTipoId(tipo.id)}
                    className={enlaceSutil}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      manejarToggleTipoActivo(tipo.id, tipo.activo)
                    }
                    className={enlacePeligro}
                  >
                    {tipo.activo ? "Desactivar" : "Activar"}
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <form
          action={manejarCrearTipoServicio}
          className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border"
        >
          <input
            name="nombre"
            value={nombreNuevoTipo}
            onChange={(e) => setNombreNuevoTipo(e.target.value)}
            placeholder="Nombre del servicio"
            className="flex-1 border border-surface-border rounded-btn px-3 py-2 text-sm bg-surface-card text-ink"
          />
          <input
            name="duracion_minutos"
            type="number"
            value={duracionNuevoTipo}
            onChange={(e) => setDuracionNuevoTipo(e.target.value)}
            placeholder="Min."
            className="w-24 border border-surface-border rounded-btn px-3 py-2 text-sm bg-surface-card text-ink"
          />
          <button type="submit" disabled={creandoTipo} className={botonPrimario}>
            {creandoTipo ? "..." : "Añadir"}
          </button>
        </form>
        {mensajeTipo && (
          <p className="text-xs text-ink-muted mt-2">{mensajeTipo}</p>
        )}
      </section>
    </div>
  );
}