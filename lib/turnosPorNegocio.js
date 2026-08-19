import { createClient } from "@/lib/supabase/server";

export async function obtenerTurnos(negocioId) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("turnos")
    .select("id, nombre, inicio, fin")
    .eq("negocio_id", negocioId)
    .order("orden", { ascending: true });

  if (error || !data) return [];

  return data.map((t) => ({
    id: t.id,
    nombre: t.nombre,
    inicio: t.inicio?.slice(0, 5),
    fin: t.fin?.slice(0, 5),
  }));
}