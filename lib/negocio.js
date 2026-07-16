import { cookies } from "next/headers";

export async function getNegociosDelUsuario(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("usuarios_negocio")
    .select("rol, negocios ( id, nombre, tipo_negocio, config_capacidad )")
    .eq("user_id", user?.id);

  return (data || [])
    .filter((row) => row.negocios)
    .map((row) => ({
      id: row.negocios.id,
      nombre: row.negocios.nombre,
      tipo_negocio: row.negocios.tipo_negocio,
      config_capacidad: row.negocios.config_capacidad,
      rol: row.rol,
    }));
}

export async function getNegocioActual(supabase) {
  const negocios = await getNegociosDelUsuario(supabase);

  if (negocios.length === 0) {
    return { negocioId: null, rol: null, negocio: null, negocios: [] };
  }

  const cookieStore = cookies();
  const negocioCookie = cookieStore.get("negocio_activo")?.value;
  const negocioIdCookie = negocioCookie ? Number(negocioCookie) : null;

  const seleccionado =
    negocios.find((n) => n.id === negocioIdCookie) || negocios[0];

  return {
    negocioId: seleccionado.id,
    rol: seleccionado.rol,
    negocio: seleccionado,
    negocios,
  };
}
