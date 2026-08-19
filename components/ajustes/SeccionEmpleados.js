"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { useToast } from "@/components/ToastProvider";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "border border-surface-border rounded-btn px-3 py-1.5 text-sm bg-surface-card text-ink focus:outline-none focus:ring-1 focus:ring-brand";

export default function SeccionEmpleados({ empleados = [] }) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nombreEdit, setNombreEdit] = useState("");
  const [cargando, setCargando] = useState(false);
  const { mostrarToast } = useToast();
  const supabase = createClient();

  async function handleCrear(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setCargando(true);
    
    // Obtener negocio_id de la sesión o del primer empleado
    const negocioId = empleados[0]?.negocio_id;

    const { error } = await supabase.from("recursos").insert({
      nombre: nuevoNombre.trim(),
      tipo: "empleado",
      activo: true,
      ...(negocioId ? { negocio_id: negocioId } : {}),
    });

    setCargando(false);

    if (error) {
      mostrarToast(error.message, "error");
    } else {
      setNuevoNombre("");
      mostrarToast("Empleado añadido.", "exito");
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
      mostrarToast("Empleado actualizado.", "exito");
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
      mostrarToast(
        activoActual ? "Empleado desactivado." : "Empleado activado.",
        "exito"
      );
      window.location.reload();
    }
  }

  return (
    <div className="bg-surface-card border border-surface-border rounded-card p-5 space-y-4">
      <h2 className="text-base font-semibold text-ink">Recursos y Empleados</h2>

      <div className="divide-y divide-surface-border">
        {empleados.map((emp) => (
          <div key={emp.id} className="py-2.5 flex items-center justify-between text-sm">
            {editandoId === emp.id ? (
              <div className="flex items-center gap-2 flex-1 mr-4">
                <input
                  type="text"
                  value={nombreEdit}
                  onChange={(e) => setNombreEdit(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => handleGuardarEdit(emp.id)}
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
              <span className={`font-medium ${!emp.activo ? "line-through text-ink-muted" : "text-ink"}`}>
                {emp.nombre}
              </span>
            )}

            {editandoId !== emp.id && (
              <div className="flex items-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setEditandoId(emp.id);
                    setNombreEdit(emp.nombre);
                  }}
                  className="text-ink-muted hover:text-ink underline"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleEstado(emp.id, emp.activo)}
                  className={emp.activo ? "text-status-occupied hover:underline" : "text-brand hover:underline"}
                >
                  {emp.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            )}
          </div>
        ))}

        {empleados.length === 0 && (
          <p className="text-xs text-ink-muted py-2">No hay empleados registrados.</p>
        )}
      </div>

      <form onSubmit={handleCrear} className="flex gap-2 pt-2">
        <input
          type="text"
          placeholder="Nombre del profesional..."
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