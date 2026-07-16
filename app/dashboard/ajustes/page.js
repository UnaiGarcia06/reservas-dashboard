import { createClient } from "@/lib/supabase/server";
import AjustesForm from "@/components/AjustesForm";

export default async function AjustesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarioNegocio } = await supabase
    .from("usuarios_negocio")
    .select("negocio_id")
    .eq("user_id", user?.id)
    .single();

  const negocioId = usuarioNegocio?.negocio_id;

  const { data: negocio } = await supabase
    .from("negocios")
    .select("nombre, config_capacidad")
    .eq("id", negocioId)
    .single();

  const { data: recursos } = await supabase
    .from("recursos")
    .select("id, nombre, activo")
    .eq("negocio_id", negocioId)
    .order("nombre", { ascending: true });

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-1">Ajustes del negocio</h1>
      <p className="text-ink-600 text-sm mb-8">
        Datos generales, turnos y recursos.
      </p>
      <AjustesForm negocio={negocio} recursos={recursos || []} />
    </div>
  );
}
