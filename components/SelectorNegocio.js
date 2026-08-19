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
      className="w-full bg-slate-900 text-white text-xs rounded-btn px-3 py-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-stamp-amber focus:border-stamp-amber transition-colors cursor-pointer"
    >
      {negocios.map((n) => (
        <option 
          key={n.id} 
          value={n.id} 
          className="bg-slate-900 text-white py-1.5"
        >
          {n.nombre}
        </option>
      ))}
    </select>
  );
}