"use client";

import { cambiarNegocio } from "@/lib/actions/negocio";

export default function SelectorNegocio({ negocios, negocioId }) {
  async function manejarCambio(e) {
    await cambiarNegocio(e.target.value);
  }

  return (
    <select
      defaultValue={negocioId}
      onChange={manejarCambio}
      className="w-full bg-ink-800 text-paper-0 text-xs rounded px-2 py-2 border border-ink-800 mb-6"
    >
      {negocios.map((n) => (
        <option key={n.id} value={n.id}>
          {n.nombre}
        </option>
      ))}
    </select>
  );
}
