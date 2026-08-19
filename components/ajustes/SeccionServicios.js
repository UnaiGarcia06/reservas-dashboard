"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SeccionServicios({ servicios, negocioId }) {
  const [nombre, setNombre] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !duracion) return;

    setLoading(true);
    const { error } = await supabase.from("tipos_servicio").insert([
      {
        negocio_id: negocioId,
        nombre: nombre.trim(),
        duracion_minutos: parseInt(duracion, 10),
        precio: precio ? parseFloat(precio) : null,
        activo: true,
      },
    ]);

    setLoading(false);
    if (!error) {
      setNombre("");
      setDuracion("");
      setPrecio("");
      router.refresh();
    }
  };

  const handleToggleActivo = async (id, estadoActual) => {
    await supabase
      .from("tipos_servicio")
      .update({ activo: !estadoActual })
      .eq("id", id);
    router.refresh();
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
      <h2 className="text-lg font-medium text-ink">Tipos de servicio</h2>

      <div className="space-y-2">
        {servicios.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border/50 text-sm"
          >
            <div>
              <span className={`font-medium ${!s.activo ? "line-through text-ink-muted" : "text-ink"}`}>
                {s.nombre}
              </span>
              <span className="text-ink-muted text-xs ml-2">
                ({s.duracion_minutos} min{s.precio ? ` - ${s.precio}€` : ""})
              </span>
            </div>
            <button
              onClick={() => handleToggleActivo(s.id, s.activo)}
              className="text-xs text-red-500 hover:underline"
            >
              {s.activo ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}

        {servicios.length === 0 && (
          <p className="text-sm text-ink-muted italic">No hay servicios registrados.</p>
        )}
      </div>

      <form onSubmit={handleAgregar} className="flex gap-2 pt-2">
        <input
          type="text"
          placeholder="Nombre del servicio (ej: Corte)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-accent"
        />
        <input
          type="number"
          placeholder="Min."
          value={duracion}
          onChange={(e) => setDuracion(e.target.value)}
          className="w-20 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-accent"
        />
        <input
          type="number"
          placeholder="Precio (€)"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          className="w-24 px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={loading || !nombre.trim() || !duracion}
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg disabled:opacity-50 hover:bg-accent/90"
        >
          Añadir
        </button>
      </form>
    </div>
  );
}