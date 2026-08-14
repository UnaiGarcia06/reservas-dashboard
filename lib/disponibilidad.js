export const DURACION_POR_DEFECTO = 90; // minutos

export function horaAMinutos(hora) {
  if (!hora) return 0;
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function seSolapan(horaA, duracionA, horaB, duracionB) {
  const inicioA = horaAMinutos(horaA);
  const finA = inicioA + duracionA;
  const inicioB = horaAMinutos(horaB);
  const finB = inicioB + duracionB;
  return inicioA < finB && inicioB < finA;
}

export function idsDeReserva(cita) {
  if (cita.recurso_ids && cita.recurso_ids.length > 0) return cita.recurso_ids;
  if (cita.recurso_id) return [cita.recurso_id];
  return [];
}

export function mesasOcupadasEnFechaHora({ citas, fecha, hora, excluirId }) {
  const ocupadas = new Set();
  if (!hora) return ocupadas;

  for (const c of citas || []) {
    if (c.fecha !== fecha) continue;
    if (excluirId && c.id === excluirId) continue;
    const solapa = seSolapan(
      hora,
      DURACION_POR_DEFECTO,
      c.hora,
      c.duracion_minutos || DURACION_POR_DEFECTO
    );
    if (!solapa) continue;
    for (const id of idsDeReserva(c)) ocupadas.add(id);
  }

  return ocupadas;
}