"use client";

import { useState } from "react";
import {
  actualizarDatosGenerales,
  crearTurno,
  actualizarTurno,
  eliminarTurno,
  crearZona,
  actualizarZona,
  toggleZonaActiva,
  obtenerImpactoEliminarZona,
  eliminarZona,
  crearRecurso,
  actualizarRecurso,
  toggleRecursoActivo,
  eliminarRecurso,
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

function Seccion({ titulo, children }) {
  return (
    <section className="bg-surface-card rounded-card border border-surface-border shadow-card p-5">
      <h2 className="text-base font-semibold text-ink mb-4">{titulo}</h2>
      {children}
    </section>
  );
}

export default function AjustesForm({ negocio, zonas, recursos, turnos, tiposServicio }) {
  // ---------- Datos generales ----------
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

  // ---------- Turnos ----------
  const [editandoTurnoId, setEditandoTurnoId] = useState(null);
  const [creandoTurno, setCreandoTurno] = useState(false);
  const [mensajeTurno, setMensajeTurno] = useState(null);
  const [borrandoTurnoId, setBorrandoTurnoId] = useState(null);
  const [confirmandoBorrarTurno, setConfirmandoBorrarTurno] = useState(null);

  async function manejarCrearTurno(formData) {
    setCreandoTurno(true);
    setMensajeTurno(null);
    const resultado = await crearTurno(formData);
    setCreandoTurno(false);
    if (resultado?.error) setMensajeTurno(resultado.error);
  }

  async function manejarActualizarTurno(id, formData) {
    const resultado = await actualizarTurno(id, formData);
    if (!resultado?.error) setEditandoTurnoId(null);
    else setMensajeTurno(resultado.error);
  }

  async function manejarBorrarTurno(id) {
    setBorrandoTurnoId(id);
    const resultado = await eliminarTurno(id);
    setBorrandoTurnoId(null);
    setConfirmandoBorrarTurno(null);
    if (resultado?.error) setMensajeTurno(resultado.error);
  }

  // ---------- Zonas y mesas ----------
  const [editandoZonaId, setEditandoZonaId] = useState(null);
  const [creandoZona, setCreandoZona] = useState(false);
  const [mensajeZona, setMensajeZona] = useState(null);

  const [editandoRecursoId, setEditandoRecursoId] = useState(null);
  const [creandoRecursoEnZona, setCreandoRecursoEnZona] = useState(null);
  const [mensajeRecurso, setMensajeRecurso] = useState(null);

  // Diálogo de borrado de zona
  const [zonaAConfirmar, setZonaAConfirmar] = useState(null); // { id, nombre }
  const [impacto, setImpacto] = useState(null); // { numMesas, reservasFuturas }
  const [cargandoImpacto, setCargandoImpacto] = useState(false);
  const [eliminandoZona, setEliminandoZona] = useState(false);

  const recursosPorZona = {};
  const recursosSinZona = [];
  for (const r of recursos) {
    if (r.zona_id) {
      recursosPorZona[r.zona_id] = recursosPorZona[r.zona_id] || [];
      recursosPorZona[r.zona_id].push(r);
    } else {
      recursosSinZona.push(r);
    }
  }

  async function manejarCrearZona(formData) {
    setCreandoZona(true);
    setMensajeZona(null);
    const resultado = await crearZona(formData);
    setCreandoZona(false);
    if (resultado?.error) setMensajeZona(resultado.error);
  }

  async function manejarActualizarZona(id, formData) {
    const resultado = await actualizarZona(id, formData);
    if (!resultado?.error) setEditandoZonaId(null);
    else setMensajeZona(resultado.error);
  }

  async function manejarToggleZona(id, activaActual) {
    const resultado = await toggleZonaActiva(id, !activaActual);
    if (resultado?.error) setMensajeZona(resultado.error);
  }

  async function manejarClicEliminarZona(zona) {
    setMensajeZona(null);
    setCargandoImpacto(true);
    const resultado = await obtenerImpactoEliminarZona(zona.id);
    setCargandoImpacto(false);

    if (resultado?.error) {
      setMensajeZona(resultado.error);
      return;
    }

    setImpacto(resultado);
    setZonaAConfirmar(zona);
  }

  async function manejarConfirmarEliminarZona() {
    if (!zonaAConfirmar) return;
    setEliminandoZona(true);
    const resultado = await eliminarZona(zonaAConfirmar.id);
    setEliminandoZona(false);

    if (resultado?.error) {
      // Puede que en el momento de confirmar hayan aparecido reservas nuevas.
      setImpacto({
        numMesas: impacto?.numMesas || 0,
        reservasFuturas: resultado.reservasFuturas || [],
      });
      setMensajeZona(resultado.error);
      return;
    }

    setZonaAConfirmar(null);
    setImpacto(null);
  }

  async function manejarCrearRecurso(zonaId, formData) {
    setMensajeRecurso(null);
    const resultado = await crearRecurso(formData);
    if (resultado?.error) {
      setMensajeRecurso(resultado.error);
    } else {
      setCreandoRecursoEnZona(null);
    }
  }

  async function manejarActualizarRecurso(id, formData) {
    const resultado = await actualizarRecurso(id, formData);
    if (!resultado?.error) {
      setEditandoRecursoId(null);
    } else {
      setMensajeRecurso(resultado.error);
    }
  }

  async function manejarToggleRecursoActivo(id, activoActual) {
    await toggleRecursoActivo(id, !activoActual);
  }

  async function manejarEliminarRecurso(id) {
    setMensajeRecurso(null);
    const resultado = await eliminarRecurso(id);
    if (resultado?.error) setMensajeRecurso(resultado.error);
  }

  // ---------- Tipos de servicio ----------
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
    if (!resultado?.error) setEditandoTipoId(null);
  }

  async function manejarToggleTipoActivo(id, activoActual) {
    await toggleTipoServicioActivo(id, !activoActual);
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Datos generales */}
      <Seccion titulo="Datos generales">
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
        {mensajeNombre && <p className="text-xs text-ink-muted mt-2">{mensajeNombre}</p>}
      </Seccion>

      {/* Turnos */}
      <Seccion titulo="Turnos">
        <div className="space-y-3">
          {turnos.map((turno) =>
            editandoTurnoId === turno.id ? (
              <form
                key={turno.id}
                action={(formData) => manejarActualizarTurno(turno.id, formData)}
                className="flex items-end gap-2"
              >
                <div className="flex-1">
                  <label className={labelClass}>Nombre</label>
                  <input name="nombre" defaultValue={turno.nombre} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Inicio</label>
                  <input
                    type="time"
                    name="inicio"
                    defaultValue={turno.inicio}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fin</label>
                  <input type="time" name="fin" defaultValue={turno.fin} className={inputClass} />
                </div>
                <button type="submit" className={`${enlaceSutil} pb-2`}>
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoTurnoId(null)}
                  className="text-xs text-ink-muted cursor-pointer pb-2"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <div
                key={turno.id}
                className="flex items-center gap-3 border-b border-surface-border pb-2 last:border-0"
              >
                <span className="flex-1 text-sm text-ink">
                  {turno.nombre} · {turno.inicio}–{turno.fin}
                </span>
                <button
                  onClick={() => setEditandoTurnoId(turno.id)}
                  className={enlaceSutil}
                >
                  Editar
                </button>
                {confirmandoBorrarTurno === turno.id ? (
                  <span className="flex items-center gap-2">
                    <button
                      onClick={() => manejarBorrarTurno(turno.id)}
                      disabled={borrandoTurnoId === turno.id}
                      className={enlacePeligro}
                    >
                      {borrandoTurnoId === turno.id ? "..." : "Confirmar"}
                    </button>
                    <button
                      onClick={() => setConfirmandoBorrarTurno(null)}
                      className="text-xs text-ink-muted cursor-pointer"
                    >
                      No
                    </button>
                  </span>
                ) : (
                  <button
                    onClick={() => setConfirmandoBorrarTurno(turno.id)}
                    className={enlacePeligro}
                  >
                    Quitar
                  </button>
                )}
              </div>
            )
          )}
          {turnos.length === 0 && (
            <p className="text-sm text-ink-muted">Aún no hay turnos configurados.</p>
          )}
        </div>

        <form
          action={manejarCrearTurno}
          className="flex items-end gap-2 mt-4 pt-3 border-t border-surface-border"
        >
          <div className="flex-1">
            <label className={labelClass}>Nombre</label>
            <input name="nombre" placeholder="ej. Comida" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Inicio</label>
            <input type="time" name="inicio" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fin</label>
            <input type="time" name="fin" className={inputClass} />
          </div>
          <button type="submit" disabled={creandoTurno} className={botonPrimario}>
            {creandoTurno ? "..." : "Añadir"}
          </button>
        </form>
        {mensajeTurno && <p className="text-xs text-ink-muted mt-2">{mensajeTurno}</p>}
      </Seccion>

      {/* Zonas y mesas */}
      <Seccion titulo="Zonas y mesas">
        <div className="space-y-5">
          {zonas.map((zona) => {
            const mesasDeZona = recursosPorZona[zona.id] || [];
            return (
              <div key={zona.id} className="border border-surface-border rounded-btn p-3">
                <div className="flex items-center gap-2 mb-2">
                  {editandoZonaId === zona.id ? (
                    <form
                      action={(formData) => manejarActualizarZona(zona.id, formData)}
                      className="flex items-center gap-2 flex-1"
                    >
                      <input
                        name="nombre"
                        defaultValue={zona.nombre}
                        className="flex-1 border border-surface-border rounded-btn px-3 py-1 text-sm bg-surface-card text-ink"
                      />
                      <button type="submit" className={enlaceSutil}>
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditandoZonaId(null)}
                        className="text-xs text-ink-muted cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </form>
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-sm font-semibold ${
                          zona.activa ? "text-ink" : "text-ink-muted line-through"
                        }`}
                      >
                        {zona.nombre}
                      </span>
                      <button onClick={() => setEditandoZonaId(zona.id)} className={enlaceSutil}>
                        Editar
                      </button>
                      <button
                        onClick={() => manejarToggleZona(zona.id, zona.activa)}
                        className={enlaceSutil}
                      >
                        {zona.activa ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => manejarClicEliminarZona(zona)}
                        disabled={cargandoImpacto}
                        className={enlacePeligro}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>

                {!zona.activa && (
                  <p className="text-xs text-ink-muted mb-2">
                    Zona desactivada — sus mesas no aparecen como disponibles.
                  </p>
                )}

                <div className="space-y-1.5 pl-3">
                  {mesasDeZona.map((recurso) => (
                    <FilaRecurso
                      key={recurso.id}
                      recurso={recurso}
                      zonas={zonas}
                      editando={editandoRecursoId === recurso.id}
                      onEditar={() => setEditandoRecursoId(recurso.id)}
                      onCancelar={() => setEditandoRecursoId(null)}
                      onGuardar={(formData) => manejarActualizarRecurso(recurso.id, formData)}
                      onToggle={() => manejarToggleRecursoActivo(recurso.id, recurso.activo)}
                      onEliminar={() => manejarEliminarRecurso(recurso.id)}
                    />
                  ))}
                  {mesasDeZona.length === 0 && (
                    <p className="text-xs text-ink-muted">Sin mesas en esta zona.</p>
                  )}
                </div>

                {creandoRecursoEnZona === zona.id ? (
                  <form
                    action={(formData) => manejarCrearRecurso(zona.id, formData)}
                    className="flex items-center gap-2 mt-2 pl-3"
                  >
                    <input type="hidden" name="zona_id" value={zona.id} />
                    <input
                      name="nombre"
                      placeholder="Nombre de la mesa"
                      className="flex-1 border border-surface-border rounded-btn px-3 py-1.5 text-sm bg-surface-card text-ink"
                    />
                    <input
                      name="tipo"
                      placeholder="Tipo (ej. mesa)"
                      className="w-32 border border-surface-border rounded-btn px-3 py-1.5 text-sm bg-surface-card text-ink"
                    />
                    <button type="submit" className={enlaceSutil}>
                      Añadir
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreandoRecursoEnZona(null)}
                      className="text-xs text-ink-muted cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setCreandoRecursoEnZona(zona.id)}
                    className={`${enlaceSutil} mt-2 ml-3`}
                  >
                    + Añadir mesa
                  </button>
                )}
              </div>
            );
          })}

          {recursosSinZona.length > 0 && (
            <div className="border border-dashed border-surface-border rounded-btn p-3">
              <span className="text-sm font-semibold text-ink-muted">Sin zona asignada</span>
              <div className="space-y-1.5 pl-3 mt-2">
                {recursosSinZona.map((recurso) => (
                  <FilaRecurso
                    key={recurso.id}
                    recurso={recurso}
                    zonas={zonas}
                    editando={editandoRecursoId === recurso.id}
                    onEditar={() => setEditandoRecursoId(recurso.id)}
                    onCancelar={() => setEditandoRecursoId(null)}
                    onGuardar={(formData) => manejarActualizarRecurso(recurso.id, formData)}
                    onToggle={() => manejarToggleRecursoActivo(recurso.id, recurso.activo)}
                    onEliminar={() => manejarEliminarRecurso(recurso.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          action={manejarCrearZona}
          className="flex items-center gap-2 mt-4 pt-3 border-t border-surface-border"
        >
          <input
            name="nombre"
            placeholder="Nombre de la nueva zona"
            className="flex-1 border border-surface-border rounded-btn px-3 py-2 text-sm bg-surface-card text-ink"
          />
          <button type="submit" disabled={creandoZona} className={botonPrimario}>
            {creandoZona ? "..." : "Añadir zona"}
          </button>
        </form>
        {mensajeZona && <p className="text-xs text-ink-muted mt-2">{mensajeZona}</p>}
      </Seccion>

      {/* Tipos de servicio */}
      <Seccion titulo="Tipos de servicio">
        <div className="space-y-2">
          {(tiposServicio || []).map((tipo) => (
            <div
              key={tipo.id}
              className="flex items-center gap-3 border-b border-surface-border pb-2 last:border-0"
            >
              {editandoTipoId === tipo.id ? (
                <form
                  action={(formData) => manejarActualizarTipoServicio(tipo.id, formData)}
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
                  <button onClick={() => setEditandoTipoId(tipo.id)} className={enlaceSutil}>
                    Editar
                  </button>
                  <button
                    onClick={() => manejarToggleTipoActivo(tipo.id, tipo.activo)}
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
        {mensajeTipo && <p className="text-xs text-ink-muted mt-2">{mensajeTipo}</p>}
      </Seccion>

      {/* Diálogo de confirmación para eliminar zona */}
      {zonaAConfirmar && impacto && (
        <div className="fixed inset-0 bg-sidebar/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card rounded-panel border border-surface-border w-full max-w-md p-6 shadow-elevated">
            {impacto.reservasFuturas.length > 0 ? (
              <>
                <h3 className="text-base font-semibold text-ink mb-2">
                  No se puede eliminar "{zonaAConfirmar.nombre}"
                </h3>
                <p className="text-sm text-ink-muted mb-3">
                  Tienes reservas futuras en mesas de esta zona. Primero borra o desplaza
                  estas reservas a otra zona para poder eliminarla.
                </p>
                <div className="space-y-1.5 mb-4 max-h-48 overflow-y-auto">
                  {impacto.reservasFuturas.map((r) => (
                    <div
                      key={r.id}
                      className="text-xs text-ink border border-surface-border rounded-btn px-2.5 py-1.5"
                    >
                      {r.fecha} · {r.hora} — {r.nombre_cliente} ({r.mesas})
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setZonaAConfirmar(null);
                    setImpacto(null);
                  }}
                  className={botonPrimario}
                >
                  Cerrar
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-ink mb-2">
                  ¿Eliminar "{zonaAConfirmar.nombre}"?
                </h3>
                <p className="text-sm text-ink-muted mb-4">
                  {impacto.numMesas > 0
                    ? `Esta zona tiene ${impacto.numMesas} mesa(s) asignada(s). Al eliminarla, esas mesas quedarán sin zona.`
                    : "Esta zona no tiene mesas asignadas."}{" "}
                  ¿Estás seguro de que quieres continuar?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={manejarConfirmarEliminarZona}
                    disabled={eliminandoZona}
                    className="bg-status-occupied text-white rounded-btn px-4 py-2 text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {eliminandoZona ? "..." : "Eliminar"}
                  </button>
                  <button
                    onClick={() => {
                      setZonaAConfirmar(null);
                      setImpacto(null);
                    }}
                    className="text-sm text-ink-muted px-4 py-2"
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilaRecurso({ recurso, zonas, editando, onEditar, onCancelar, onGuardar, onToggle, onEliminar }) {
  if (editando) {
    return (
      <form action={onGuardar} className="flex items-center gap-2">
        <input
          name="nombre"
          defaultValue={recurso.nombre}
          className="flex-1 border border-surface-border rounded-btn px-3 py-1 text-sm bg-surface-card text-ink"
        />
        <select
          name="zona_id"
          defaultValue={recurso.zona_id || ""}
          className="border border-surface-border rounded-btn px-2 py-1 text-sm bg-surface-card text-ink"
        >
          <option value="">Sin zona</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
        <button type="submit" className={enlaceSutil}>
          Guardar
        </button>
        <button type="button" onClick={onCancelar} className="text-xs text-ink-muted cursor-pointer">
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className={`flex-1 text-sm ${recurso.activo ? "text-ink" : "text-ink-muted line-through"}`}>
        {recurso.nombre}
      </span>
      <button onClick={onEditar} className={enlaceSutil}>
        Editar
      </button>
      <button onClick={onToggle} className={enlaceSutil}>
        {recurso.activo ? "Desactivar" : "Activar"}
      </button>
      <button onClick={onEliminar} className={enlacePeligro}>
        Eliminar
      </button>
    </div>
  );
}