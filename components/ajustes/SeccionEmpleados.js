"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { eliminarRecurso } from "@/lib/actions/negocio";

const inputClass =
  "border border-surface-border rounded-btn px-3 py-1.5 text-sm bg-surface-card text-ink focus:outline-none focus:ring-1 focus:ring-brand";

export default function SeccionEmpleados({ 
  items = [], 
  titulo = "Empleados", 
  placeholder = "Nombre del empleado...", 
  tipo = "empleado" 
}) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [cargando, setCargando] = useState(false);
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);
  const { mostrarToast } = useToast();
  const supabase = createClient();

  // Filtramos solo los elementos del tipo correspondiente
  const listaFiltrada = items.filter((item) => (item.tipo ?? "empleado") === tipo);

  async function handleCrear(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setCargando(true);
    const negocioId = items[0]?.negocio_id;

    const { error } = await supabase.from("recursos").insert({
      nombre: nuevoNombre.trim(),
      tipo: tipo,
      activo: true,
      ...(negocioId ? { negocio_id: negocioId } : {}),
    });

    setCargando(false);

    if (error) {
      mostrarToast(error.message, "error");
    } else {
      setNuevoNombre("");
      mostrarToast(`${titulo} añadido correctamente.`, "exito");
      window.location.reload();
    }
  }

  async function handleGuardarEdit(id) {
    if (!nombreEdit.trim()) return;

    setCargando(true);
    const { error } = await supabase
      .from("recursos")
      .update({ nombre: nombreEdit.trim() })
      .eq("id", id);

    setCargando(false);

    if (error) {
      mostrarToast(error.message, "error");
    } else {
      setEditandoId(null);
      mostrarToast("Actualizado correctamente.", "exito");
      window.location.reload();
    }
  }

  async function handleToggleEstado(id, activoActual) {
    const { error } = await supabase
      .from("recursos")
      .update({ activo: !activoActual })
      .eq("id", id);

    if (error) {
      mostrarToast(error.message, "error");
    } else {
      mostrarToast(activoActual ? "Desactivado." : "Activado.", "exito");
      window.location.reload();
    }
  }

  async function handleEliminar(id) {
    setEliminandoId(id);
    const resultado = await eliminarRecurso(id);
    setEliminandoId(null);
    setConfirmandoEliminarId(null);

    if (resultado?.error) {
      mostrarToast(resultado.error, "error");
    } else {
      mostrarToast("Eliminado correctamente.", "exito");
      window.location.reload();
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-card p-5 space-y-4">
      <h2 className="text-base font-semibold text-ink">{titulo}</h2>

      <div className="divide-y divide-surface-border">
        {listaFiltrada.map((item) => (
          <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
            {editandoId === item.id ? (
              <div className="flex items-center gap-2 flex-1 mr-4">
                <input
                  type="text"
                  value={nombreEdit}
                  onChange={(e) => setNombreEdit(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => handleGuardarEdit(item.id)}
                  className="text-xs text-brand hover:underline font-medium"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoId(null)}
                  className="text-xs text-ink-muted hover:underline"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <span className={`font-medium ${!item.activo ? "line-through text-ink-muted" : "text-ink"}`}>
                {item.nombre}
              </span>
            )}

            {editandoId !== item.id && (
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(item.id);
                    setNombreEdit(item.nombre);
                  }}
                  className="text-ink-muted hover:text-ink underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEstado(item.id, item.activo)}
                  className={item.activo ? "text-status-occupied hover:underline" : "text-brand hover:underline"}
                >
                  {item.activo ? "Desactivar" : "Activar"}
                </button>
                {confirmandoEliminarId === item.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleEliminar(item.id)}
                      disabled={eliminandoId === item.id}
                      className="text-status-occupied hover:underline font-medium"
                    >
                      {eliminandoId === item.id ? "..." : "Confirmar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoEliminarId(null)}
                      className="text-ink-muted hover:underline"
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmandoEliminarId(item.id)}
                    className="text-status-occupied hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {listaFiltrada.length === 0 && (
          <p className="text-xs text-ink-muted py-2">No hay ningún registro asignado.</p>
        )}
      </div>

      <form onSubmit={handleCrear} className="flex gap-2 pt-2">
        <input
          type="text"
          placeholder={placeholder}
          value={nuevoNombre}
          onChange={(e) => setNuevoNombre(e.target.value)}
          className={`${inputClass} flex-1`}
        />
        <Button type="submit" disabled={cargando}>
          Añadir
        </Button>
      </form>
    </div>
  );
}