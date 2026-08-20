"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getNegociosDelUsuario, getNegocioActual } from "@/lib/negocio";

async function getNegocioId(supabase) {
  const { negocioId } = await getNegocioActual(supabase);
  return negocioId;
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

export async function crearTurno(formData) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre = formData.get("nombre")?.toString().trim();
  const inicio = formData.get("inicio")?.toString();
  const fin = formData.get("fin")?.toString();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  if (!inicio || !fin) {
    return { error: "Faltan las horas de inicio o fin." };
  }

  const { error } = await supabase.from("turnos").insert({
    negocio_id: negocioId,
    nombre,
    inicio,
    fin,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarTurno(id, formData) {
  const supabase = createClient();

  const nombre = formData.get("nombre")?.toString().trim();
  const inicio = formData.get("inicio")?.toString();
  const fin = formData.get("fin")?.toString();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  if (!inicio || !fin) {
    return { error: "Faltan las horas de inicio o fin." };
  }

  const { error } = await supabase
    .from("turnos")
    .update({ nombre, inicio, fin })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function eliminarTurno(id) {
  const supabase = createClient();

  const { error } = await supabase.from("turnos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
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
  const tipo = formData.get("tipo")?.toString().trim();
  const zonaIdRaw = formData.get("zona_id")?.toString();
  const zona_id = zonaIdRaw ? Number(zonaIdRaw) : null;

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  if (!tipo) {
    return { error: "El tipo no puede estar vacío." };
  }

  let zonaNombre = null;
  if (zona_id) {
    const { data: zona } = await supabase
      .from("zonas")
      .select("nombre")
      .eq("id", zona_id)
      .single();
    zonaNombre = zona?.nombre || null;
  }

  const { error } = await supabase.from("recursos").insert({
    negocio_id: negocioId,
    nombre,
    tipo,
    activo: true,
    zona_id,
    zona: zonaNombre,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarRecurso(id, formData) {
  const supabase = createClient();

  const nombre = formData.get("nombre")?.toString().trim();
  const zonaIdRaw = formData.get("zona_id");

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const payload = { nombre };

  if (zonaIdRaw !== null && zonaIdRaw !== undefined) {
    const zonaIdStr = zonaIdRaw.toString();
    const zona_id = zonaIdStr ? Number(zonaIdStr) : null;
    payload.zona_id = zona_id;

    if (zona_id) {
      const { data: zona } = await supabase
        .from("zonas")
        .select("nombre")
        .eq("id", zona_id)
        .single();
      payload.zona = zona?.nombre || null;
    } else {
      payload.zona = null;
    }
  }

  const { error } = await supabase
    .from("recursos")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
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

export async function eliminarRecurso(id) {
  const supabase = createClient();

  const hoy = new Date().toISOString().slice(0, 10);
  const { data: citas, error: errorCitas } = await supabase
    .from("citas")
    .select("id")
    .neq("estado", "Cancelada")
    .gte("fecha", hoy)
    .or(`recurso_id.eq.${id},recurso_ids.cs.{${id}}`);

  if (errorCitas) {
    return { error: errorCitas.message };
  }

  if (citas && citas.length > 0) {
    return {
      error: "Esta mesa/recurso tiene reservas futuras. Cancélalas o reasígnalas antes de eliminarla.",
    };
  }

  const { error } = await supabase.from("recursos").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function cambiarNegocio(negocioId) {
  const supabase = createClient();
  const negocios = await getNegociosDelUsuario(supabase);

  const valido = negocios.some((n) => n.id === Number(negocioId));
  if (!valido) {
    return { error: "No tienes acceso a ese negocio." };
  }

  const cookieStore = cookies();
  cookieStore.set("negocio_activo", String(negocioId), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function crearTipoServicio(formData) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre = formData.get("nombre")?.toString().trim();
  const duracion_minutos = Number(formData.get("duracion_minutos"));

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  if (!duracion_minutos || duracion_minutos <= 0) {
    return { error: "La duración debe ser un número mayor que 0." };
  }

  const { error } = await supabase.from("tipos_servicio").insert({
    negocio_id: negocioId,
    nombre,
    duracion_minutos,
    activo: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarTipoServicio(id, formData) {
  const supabase = createClient();

  const nombre = formData.get("nombre")?.toString().trim();
  const duracion_minutos = Number(formData.get("duracion_minutos"));

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  if (!duracion_minutos || duracion_minutos <= 0) {
    return { error: "La duración debe ser un número mayor que 0." };
  }

  const { error } = await supabase
    .from("tipos_servicio")
    .update({ nombre, duracion_minutos })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function toggleTipoServicioActivo(id, activo) {
  const supabase = createClient();

  const { error } = await supabase
    .from("tipos_servicio")
    .update({ activo })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function crearZona(formData) {
  const supabase = createClient();
  const negocioId = await getNegocioId(supabase);

  if (!negocioId) {
    return { error: "No se pudo identificar el negocio." };
  }

  const nombre = formData.get("nombre")?.toString().trim();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const { error } = await supabase.from("zonas").insert({
    negocio_id: negocioId,
    nombre,
    activa: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarZona(id, formData) {
  const supabase = createClient();

  const nombre = formData.get("nombre")?.toString().trim();

  if (!nombre) {
    return { error: "El nombre no puede estar vacío." };
  }

  const { data: zona, error: errorLectura } = await supabase
    .from("zonas")
    .select("nombre")
    .eq("id", id)
    .single();

  if (errorLectura) {
    return { error: errorLectura.message };
  }

  const { error } = await supabase
    .from("zonas")
    .update({ nombre })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Mantenemos sincronizado el campo de texto recursos.zona con el nuevo nombre,
  // para no romper nada externo (bot de WhatsApp, etc.) que aún lo lea como string.
  if (zona?.nombre && zona.nombre !== nombre) {
    await supabase
      .from("recursos")
      .update({ zona: nombre })
      .eq("zona_id", id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function toggleZonaActiva(id, activa) {
  const supabase = createClient();

  const { error: errorZona } = await supabase
    .from("zonas")
    .update({ activa })
    .eq("id", id);

  if (errorZona) {
    return { error: errorZona.message };
  }

  // Cascada: al desactivar una zona, desactivamos también todas sus mesas.
  // Al reactivar la zona, NO reactivamos las mesas automáticamente (podrían
  // haberse desactivado individualmente antes por otro motivo).
  if (!activa) {
    const { error: errorRecursos } = await supabase
      .from("recursos")
      .update({ activo: false })
      .eq("zona_id", id);

    if (errorRecursos) {
      return { error: errorRecursos.message };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function obtenerImpactoEliminarZona(id) {
  const supabase = createClient();

  const { data: recursos, error: errorRecursos } = await supabase
    .from("recursos")
    .select("id, nombre")
    .eq("zona_id", id);

  if (errorRecursos) {
    return { error: errorRecursos.message };
  }

  const idsRecursos = (recursos || []).map((r) => r.id);

  if (idsRecursos.length === 0) {
    return { numMesas: 0, reservasFuturas: [] };
  }

  const hoy = new Date().toISOString().slice(0, 10);

  const { data: citas, error: errorCitas } = await supabase
    .from("citas")
    .select("id, nombre_cliente, fecha, hora, recurso_id, recurso_ids")
    .neq("estado", "Cancelada")
    .gte("fecha", hoy)
    .or(
      `recurso_id.in.(${idsRecursos.join(",")}),recurso_ids.ov.{${idsRecursos.join(",")}}`
    );

  if (errorCitas) {
    return { error: errorCitas.message };
  }

  const mapaNombres = {};
  for (const r of recursos) mapaNombres[r.id] = r.nombre;

  const reservasFuturas = (citas || []).map((c) => {
    const ids =
      c.recurso_ids && c.recurso_ids.length > 0
        ? c.recurso_ids
        : c.recurso_id
        ? [c.recurso_id]
        : [];
    const mesasImplicadas = ids
      .filter((rid) => idsRecursos.includes(rid))
      .map((rid) => mapaNombres[rid])
      .filter(Boolean);

    return {
      id: c.id,
      nombre_cliente: c.nombre_cliente,
      fecha: c.fecha,
      hora: c.hora?.slice(0, 5),
      mesas: mesasImplicadas.join(", "),
    };
  });

  return { numMesas: idsRecursos.length, reservasFuturas };
}

export async function eliminarZona(id) {
  const supabase = createClient();

  const impacto = await obtenerImpactoEliminarZona(id);

  if (impacto.error) {
    return { error: impacto.error };
  }

  if (impacto.reservasFuturas.length > 0) {
    return {
      error:
        "Esta zona tiene reservas futuras en sus mesas. Primero cancela o desplaza esas reservas a otra zona para poder borrarla.",
      reservasFuturas: impacto.reservasFuturas,
    };
  }

  // Las mesas de esta zona quedan sin zona asignada (no se borran)
  const { error: errorRecursos } = await supabase
    .from("recursos")
    .update({ zona_id: null })
    .eq("zona_id", id);

  if (errorRecursos) {
    return { error: errorRecursos.message };
  }

  const { error } = await supabase.from("zonas").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarCalendarioExcepciones(negocioId, calendariosExcepciones) {
  const supabase = createClient();

  const { error } = await supabase
    .from("negocios")
    .update({ calendarios_excepciones: calendariosExcepciones })
    .eq("id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}

export async function actualizarHorarioTurnos(negocioId, horario) {
  const supabase = createClient();

  const { error } = await supabase
    .from("negocios")
    .update({ horario })
    .eq("id", negocioId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/mesas");
  revalidatePath("/dashboard/ajustes");
  return { success: true };
}