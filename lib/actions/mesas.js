import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";

export async function obtenerMesasConEstado(fecha) {
  const supabase = createClient();
  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { zonas: [], reservados: 0, capacidadTotal: 0 };
  }

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, tipo, capacidad, zona")
    .eq("negocio_id", negocioId)
    .eq("activo", true)
    .order("id", { ascending: true });

  const { data: citas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, hora, estado, detalles, recurso_id")
    .eq("negocio_id", negocioId)
    .eq("fecha", fecha)
    .neq("estado", "Cancelada");

  const citasPorRecurso = {};
  for (const c of citas || []) {
    if (!c.recurso_id) continue;
    citasPorRecurso[c.recurso_id] = citasPorRecurso[c.recurso_id] || [];
    citasPorRecurso[c.recurso_id].push(c);
  }

  const mesas = (recursos || []).map((r) => {
    const reservasMesa = citasPorRecurso[r.id] || [];
    const ocupada = reservasMesa.length > 0;
    return {
      ...r,
      ocupada,
      reserva: ocupada ? reservasMesa[0] : null,
    };
  });

  const zonasMap = {};
  for (const m of mesas) {
    const zona = m.zona || "General";
    zonasMap[zona] = zonasMap[zona] || [];
    zonasMap[zona].push(m);
  }

  const zonas = Object.entries(zonasMap).map(([nombre, mesasZona]) => ({
    nombre,
    mesas: mesasZona,
  }));

  const capacidadTotal = mesas.reduce((suma, m) => suma + (m.capacidad || 0), 0);
  const reservados = (citas || []).reduce((suma, c) => {
    const p = Number(c.detalles?.personas);
    return suma + (Number.isFinite(p) ? p : 0);
  }, 0);

  return { zonas, reservados, capacidadTotal };
}