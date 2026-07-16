"use client";

import { useState } from "react";
import {
  actualizarDatosGenerales,
  actualizarTurnos,
  crearRecurso,
  actualizarRecurso,
  toggleRecursoActivo,
} from "@/lib/actions/negocio";

export default function AjustesForm({ negocio, recursos }) {
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

  return (
    <div className="max-w-2xl space-y-8">
      <section className="bg-white rounded-lg border border-paper-200 p-5">
        <h2 className="font-display text-lg mb-4">Datos generales</h2>
        <form action={manejarGuardarNombre} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
              Nombre del negocio
            </label>
            <input
              name="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
            />
          </div>
          <button
            type="submit"
            disabled={guardandoNombre}
            className="bg-ink-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {guardandoNombre ? "..." : "Guardar"}
          </button>
        </form>
        {mensajeNombre && (
          <p className="text-xs text-ink-600 mt-2">{mensajeNombre}</p>
        )}
      </section>

      <section className="bg-white rounded-lg border border-paper-200 p-5">
        <h2 className="font-display text-lg mb-4">Turnos</h2>
        <div className="space-y-3">
          {turnos.map((turno, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Nombre
                </label>
                <input
                  value={turno.nombre}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "nombre", e.target.value)
                  }
                  className="w-full border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Inicio
                </label>
                <input
                  type="time"
                  value={turno.inicio}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "inicio", e.target.value)
                  }
                  className="border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-ink-600 font-mono">
                  Fin
                </label>
                <input
                  type="time"
                  value={turno.fin}
                  onChange={(e) =>
                    actualizarTurnoLocal(index, "fin", e.target.value)
                  }
                  className="border border-paper-200 rounded px-3 py-2 text-sm mt-1"
                />
              </div>

              <button
                onClick={() => quitarTurno(index)}
                className="text-xs text-stamp-red underline cursor-pointer pb-2"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={agregarTurno}
          className="text-xs text-ink-600 underline cursor-pointer mt-3"
        >
          + Añadir turno
        </button>

        <div className="mt-4">
          <button
            onClick={manejarGuardarTurnos}
            disabled={guardandoTurnos}
            className="bg-ink-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {guardandoTurnos ? "..." : "Guardar turnos"}
          </button>
          {mensajeTurnos && (
            <p className="text-xs text-ink-600 mt-2">{mensajeTurnos}</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-lg border border-paper-200 p-5">
        <h2 className="font-display text-lg mb-4">Recursos</h2>
        <div className="space-y-2">
          {recursos.map((recurso) => (
            <div
              key={recurso.id}
              className="flex items-center gap-3 border-b border-paper-200 pb-2 last:border-0"
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
                    className="flex-1 border border-paper-200 rounded px-3 py-1 text-sm"
                  />
                  <button
                    type="submit"
                    className="text-xs text-ink-800 underline cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoRecursoId(null)}
                    className="text-xs text-ink-600 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <>
                  <span
                    className={`flex-1 text-sm ${
                      recurso.activo ? "" : "text-ink-600 line-through"
                    }`}
                  >
                    {recurso.nombre}
                  </span>
                  <button
                    onClick={() => setEditandoRecursoId(recurso.id)}
                    className="text-xs text-ink-600 underline cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() =>
                      manejarToggleActivo(recurso.id, recurso.activo)
                    }
                    className="text-xs text-stamp-red underline cursor-pointer"
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
          className="flex items-center gap-2 mt-4 pt-3 border-t border-paper-200"
        >
          <input
            name="nombre"
            value={nombreNuevoRecurso}
            onChange={(e) => setNombreNuevoRecurso(e.target.value)}
            placeholder="Nombre del recurso"
            className="flex-1 border border-paper-200 rounded px-3 py-2 text-sm"
          />
          <input
            name="tipo"
            value={tipoNuevoRecurso}
            onChange={(e) => setTipoNuevoRecurso(e.target.value)}
            placeholder="Tipo (ej. silla, sala)"
            className="flex-1 border border-paper-200 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={creandoRecurso}
            className="bg-ink-800 text-white rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {creandoRecurso ? "..." : "Añadir"}
          </button>
        </form>
        {mensajeRecurso && (
          <p className="text-xs text-ink-600 mt-2">{mensajeRecurso}</p>
        )}
      </section>
    </div>
  );
}
