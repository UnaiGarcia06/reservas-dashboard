"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getNegocioActual } from "@/lib/negocio";
import { horaAMinutos, seSolapan } from "@/lib/disponibilidad";
import { obtenerFranjaDelDia } from "@/lib/horario";

function minutosAHora(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const PASO_MINUTOS = 15;

export async function obtenerHorasLibres({ empleadoId, fecha, duracionMinutos }) {
  const supabase = createClient();
  const { negocioId, negocio } = await getNegocioActual(supabase);

  if (!negocioId || !empleadoId || !fecha || !duracionMinutos) {
    return { horas: [] };
  }

  const franja = obtenerFranjaDelDia(negocio?.horario, fecha);
  if (!franja) return { horas: [] };

  const { data: citas } = await supabase
    .from("citas")
    .select("hora, duracion_minutos, recurso_id, recurso_ids")
    .eq("negocio_id", negocioId)
    .eq("fecha", fecha)
    .neq("estado", "Cancelada");

  const empId = Number(empleadoId);
  const citasEmpleado = (citas || []).filter((c) => {
    const ids =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];
    return ids.includes(empId);
  });

  const inicioMin = horaAMinutos(franja.inicio);
  const finMin = horaAMinutos(franja.fin);
  const duracion = Number(duracionMinutos);

  const horas = [];
  for (let m = inicioMin; m + duracion <= finMin; m += PASO_MINUTOS) {
    const horaStr = minutosAHora(m);
    const libre = !citasEmpleado.some((c) =>
      seSolapan(horaStr, duracion, c.hora, c.duracion_minutos || 30)
    );
    if (libre) horas.push(horaStr);
  }

  return { horas };
}

async function verificarDisponibilidadEmpleado(supabase, {
  negocioId,
  fecha,
  hora,
  duracionMinutos,
  empleadoId,
  excluirId,
}) {
  const { data: citasDelDia } = await supabase
    .from("citas")
    .select("id, hora, duracion_minutos, recurso_id, recurso_ids, nombre_cliente")
    .eq("negocio_id", negocioId)
    .eq("fecha", fecha)
    .neq("estado", "Cancelada");

  for (const c of citasDelDia || []) {
    if (excluirId && c.id === excluirId) continue;

    const ids =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];
    if (!ids.includes(empleadoId)) continue;

    if (seSolapan(hora, duracionMinutos, c.hora, c.duracion_minutos || 30)) {
      return `Ese empleado ya tiene una cita a las ${c.hora?.slice(0, 5)} con ${c.nombre_cliente}.`;
    }
  }

  return null;
}

export async function crearReservaSlot(formData) {
  const supabase = createClient();
  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre_cliente = formData.get("nombre_cliente")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const fecha = formData.get("fecha")?.toString();
  const hora = formData.get("hora")?.toString();
  const empleado_id = Number(formData.get("empleado_id"));
  const tipo_servicio_id = Number(formData.get("tipo_servicio_id"));

  if (!nombre_cliente || !telefono || !fecha || !hora || !empleado_id || !tipo_servicio_id) {
    return { error: "Faltan campos obligatorios." };
  }

  const { data: servicio } = await supabase
    .from("tipos_servicio")
    .select("duracion_minutos")
    .eq("id", tipo_servicio_id)
    .single();

  const duracion_minutos = servicio?.duracion_minutos || 30;

  const conflicto = await verificarDisponibilidadEmpleado(supabase, {
    negocioId,
    fecha,
    hora,
    duracionMinutos: duracion_minutos,
    empleadoId: empleado_id,
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
    tipo_servicio_id,
    recurso_id: empleado_id,
    recurso_ids: [empleado_id],
    duracion_minutos,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Ya existe una reserva con ese teléfono a esa misma hora." };
    }
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function actualizarReservaSlot(id, formData) {
  const supabase = createClient();
  const { negocioId } = await getNegocioActual(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre_cliente = formData.get("nombre_cliente")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const fecha = formData.get("fecha")?.toString();
  const hora = formData.get("hora")?.toString();
  const empleado_id = Number(formData.get("empleado_id"));
  const tipo_servicio_id = Number(formData.get("tipo_servicio_id"));

  if (!nombre_cliente || !telefono || !fecha || !hora || !empleado_id || !tipo_servicio_id) {
    return { error: "Faltan campos obligatorios." };
  }

  const { data: servicio } = await supabase
    .from("tipos_servicio")
    .select("duracion_minutos")
    .eq("id", tipo_servicio_id)
    .single();

  const duracion_minutos = servicio?.duracion_minutos || 30;

  const conflicto = await verificarDisponibilidadEmpleado(supabase, {
    negocioId,
    fecha,
    hora,
    duracionMinutos: duracion_minutos,
    empleadoId: empleado_id,
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
      tipo_servicio_id,
      recurso_id: empleado_id,
      recurso_ids: [empleado_id],
      duracion_minutos,
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
  return { success: true };
}