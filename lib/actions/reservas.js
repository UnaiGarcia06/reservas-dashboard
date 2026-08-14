"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getNegocioActual } from "@/lib/negocio";

function extraerRecursoIds(formData) {
  const valores = formData.getAll("recurso_ids");
  return valores
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
}

export async function crearReserva(formData) {
  const supabase = createClient();

  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre_cliente = formData.get("nombre_cliente")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const fecha = formData.get("fecha")?.toString();
  const hora = formData.get("hora")?.toString();
  const personas = Number(formData.get("personas")) || null;
  const recurso_ids = extraerRecursoIds(formData);
  const recurso_id = recurso_ids[0] ?? null;

  if (!nombre_cliente || !telefono || !fecha || !hora) {
    return { error: "Faltan campos obligatorios." };
  }

  const { error } = await supabase.from("citas").insert({
    negocio_id: negocioId,
    nombre_cliente,
    telefono,
    fecha,
    hora,
    estado: "Confirmada",
    detalles: { personas },
    recurso_id,
    recurso_ids,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  return { success: true };
}

export async function actualizarReserva(id, formData) {
  const supabase = createClient();

  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre_cliente = formData.get("nombre_cliente")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const fecha = formData.get("fecha")?.toString();
  const hora = formData.get("hora")?.toString();
  const personas = Number(formData.get("personas")) || null;
  const recurso_ids = extraerRecursoIds(formData);
  const recurso_id = recurso_ids[0] ?? null;

  if (!nombre_cliente || !telefono || !fecha || !hora) {
    return { error: "Faltan campos obligatorios." };
  }

  const { error } = await supabase
    .from("citas")
    .update({
      nombre_cliente,
      telefono,
      fecha,
      hora,
      detalles: { personas },
      recurso_id,
      recurso_ids,
    })
    .eq("id", id)
    .eq("negocio_id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  return { success: true };
}

export async function cancelarReserva(id) {
  const supabase = createClient();

  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const { error } = await supabase
    .from("citas")
    .update({ estado: "Cancelada" })
    .eq("id", id)
    .eq("negocio_id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  return { success: true };
}