"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getNegocioId(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: usuarioNegocio } = await supabase
    .from("usuarios_negocio")
    .select("negocio_id")
    .eq("user_id", user?.id)
    .single();

  return usuarioNegocio?.negocio_id || null;
}

export async function actualizarDatosGenerales(formData) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre = formData.get("nombre")?.toString().trim();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const { error } = await supabase
    .from("negocios")
    .update({ nombre })
    .eq("id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarTurnos(turnos) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const { data: negocio, error: errorLectura } = await supabase
    .from("negocios")
    .select("config_capacidad")
    .eq("id", negocioId)
    .single();

  if (errorLectura) {
    return { error: errorLectura.message };
  }

  const nuevaConfig = {
    ...(negocio?.config_capacidad || {}),
    turnos,
  };

  const { error } = await supabase
    .from("negocios")
    .update({ config_capacidad: nuevaConfig })
    .eq("id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function crearRecurso(formData) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre = formData.get("nombre")?.toString().trim();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const { error } = await supabase.from("recursos").insert({
    negocio_id: negocioId,
    nombre,
    activo: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarRecurso(id, formData) {
  const supabase = createClient();

  const nombre = formData.get("nombre")?.toString().trim();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const { error } = await supabase
    .from("recursos")
    .update({ nombre })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function toggleRecursoActivo(id, activo) {
  const supabase = createClient();

  const { error } = await supabase
    .from("recursos")
    .update({ activo })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}
