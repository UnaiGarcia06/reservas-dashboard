import { createClient } from "@/lib/supabase/server";
import { getNegocioActual } from "@/lib/negocio";
import AjustesForm from "@/components/AjustesForm";

export default async function AjustesPage() {
  const supabase = createClient();

  const { negocioId, negocio } = await getNegocioActual(supabase);

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, activo")
    .eq("negocio_id", negocioId)
    .order("nombre", { ascending: true });

  const { data: tiposServicio } = await supabase
    .from("tipos_servicio")
    .select("id, nombre, duracion_minutos, activo")
    .eq("negocio_id", negocioId)
    .order("nombre", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-1">Ajustes del negocio</h1>
      <p className="text-ink-600 text-sm mb-8">
        Datos generales, turnos, recursos y tipos de servicio.
      </p>
      <AjustesForm
        negocio={negocio}
        recursos={recursos || []}
        tiposServicio={tiposServicio || []}
      />
    </div>
  );
}
