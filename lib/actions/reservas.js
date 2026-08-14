"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getNegocioActual } from "@/lib/negocio";

const DURACION_POR_DEFECTO = 90; // minutos

function extraerRecursoIds(formData) {
  const valores = formData.getAll("recurso_ids");
  return valores
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
}

function horaAMinutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

async function verificarDisponibilidadMesas(supabase, {
  negocioId,
  fecha,
  hora,
  recursoIds,
  excluirId,
}) {
  if (!recursoIds || recursoIds.length === 0) return null;

  const { data: citasDelDia } = await supabase
    .from("citas")
    .select("id, hora, duracion_minutos, recurso_id, recurso_ids, nombre_cliente")
    .eq("negocio_id", negocioId)
    .eq("fecha", fecha)
    .neq("estado", "Cancelada");

  const inicioNueva = horaAMinutos(hora);
  const finNueva = inicioNueva + DURACION_POR_DEFECTO;

  for (const c of citasDelDia || []) {
    if (excluirId && c.id === excluirId) continue;

    const idsExistentes =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];

    const mesaCompartida = idsExistentes.some((id) => recursoIds.includes(id));
    if (!mesaCompartida) continue;

    const inicioExistente = horaAMinutos(c.hora);
    const finExistente = inicioExistente + (c.duracion_minutos || DURACION_POR_DEFECTO);

    const seSolapan = inicioNueva < finExistente && inicioExistente < finNueva;
    if (seSolapan) {
      return `Esa mesa ya está reservada a las ${c.hora?.slice(0, 5)} para ${c.nombre_cliente}.`;
    }
  }

  return null;
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

  const conflicto = await verificarDisponibilidadMesas(supabase, {
    negocioId,
    fecha,
    hora,
    recursoIds: recurso_ids,
  });

  if (conflicto) {
    return { error: conflicto };
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
    if (error.code === "23505") {
      return { error: "Ya existe una reserva con ese teléfono a esa misma hora." };
    }
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

  const conflicto = await verificarDisponibilidadMesas(supabase, {
    negocioId,
    fecha,
    hora,
    recursoIds: recurso_ids,
    excluirId: id,
  });

  if (conflicto) {
    return { error: conflicto };
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
    if (error.code === "23505") {
      return { error: "Ya existe una reserva con ese teléfono a esa misma hora." };
    }
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