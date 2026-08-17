import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import AjustesForm from "@/components/AjustesForm";

export default async function AjustesPage() {
  const supabase = createClient();

  const { negocioId, negocio } = await getNegocioActual(supabase);

  const { data: zonas } = await supabase
    .from("zonas")
    .select("id, nombre, activa")
    .eq("negocio_id", negocioId)
    .order("orden", { ascending: true });

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, activo, zona_id")
    .eq("negocio_id", negocioId)
    .order("nombre", { ascending: true });

  const { data: turnos } = await supabase
    .from("turnos")
    .select("id, nombre, inicio, fin")
    .eq("negocio_id", negocioId)
    .order("orden", { ascending: true });

  const { data: tiposServicio } = await supabase
    .from("tipos_servicio")
    .select("id, nombre, duracion_minutos, activo")
    .eq("negocio_id", negocioId)
    .order("nombre", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">Ajustes del negocio</h1>
      <p className="text-ink-muted text-sm mb-8">
        Datos generales, turnos, zonas y recursos, y tipos de servicio.
      </p>
      <AjustesForm
        negocio={negocio}
        zonas={zonas || []}
        recursos={recursos || []}
        turnos={turnos || []}
        tiposServicio={tiposServicio || []}
      />
    </div>
  );
}