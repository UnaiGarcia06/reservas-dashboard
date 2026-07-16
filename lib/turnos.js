export function turnoDeHora(hora, turnos) {
  if (!turnos || turnos.length === 0) return "Reservas";
  const minutos = horaAMinutos(hora);
  for (const turno of turnos) {
    const inicio = horaAMinutos(turno.inicio);
    const fin = horaAMinutos(turno.fin);
    if (minutos >= inicio && minutos <= fin) {
      return turno.nombre;
    }
  }
  return "Otro horario";
}

function horaAMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function agruparPorTurno(reservas, turnos) {
  const grupos = {};
  const orden = (turnos || []).map((t) => t.nombre);

  for (const r of reservas) {
    const nombreTurno = turnoDeHora(r.hora, turnos);
    grupos[nombreTurno] = grupos[nombreTurno] || [];
    grupos[nombreTurno].push(r);
  }

  const clavesOrdenadas = [
    ...orden.filter((nombre) => grupos[nombre]),
    ...Object.keys(grupos).filter((nombre) => !orden.includes(nombre)),
  ];

  return clavesOrdenadas.map((nombre) => ({ nombre, reservas: grupos[nombre] }));
}
