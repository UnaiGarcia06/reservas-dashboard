"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";

export default function FiltroFecha({ fecha, turno }) {
  const router = useRouter();
  const [valor, setValor] = useState(fecha);

  function irAFecha() {
    const params = new URLSearchParams();
    params.set("fecha", valor);
    if (turno) params.set("turno", turno);
    router.push(`?${params.toString()}`);
  }

  return (
    <div>
      <label className="text-[11px] uppercase tracking-wider text-ink-muted font-mono">
        Fecha de negocio
      </label>
      <div className="flex gap-2 mt-1">
        <input
          type="date"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="flex-1 border border-surface-border rounded-btn px-2 py-1.5 text-sm text-ink bg-surface-card"
        />
        <Button size="sm" onClick={irAFecha}>
          Ver
        </Button>
      </div>
    </div>
  );
}