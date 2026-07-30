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
      className="w-full bg-ink-900 text-paper-0 text-xs rounded-btn px-3 py-2 border border-ink-800 focus:outline-none focus:ring-1 focus:ring-stamp-amber focus:border-stamp-amber transition-colors cursor-pointer"
    >
      {negocios.map((n) => (
        <option key={n.id} value={n.id}>
          {n.nombre}
        </option>
      ))}
    </select>
  );
}