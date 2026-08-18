export function obtenerFranjaDelDia(horario, fecha) {
  const dias = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const fechaObj = new Date(fecha + "T00:00:00");
  const diaKey = dias[fechaObj.getDay()];
  const config = horario?.[diaKey];

  if (!config || !config.abierto || !config.franjas || config.franjas.length === 0) {
    return null;
  }

  let inicio = config.franjas[0][0];
  let fin = config.franjas[0][1];
  for (const f of config.franjas) {
    if (f[0] < inicio) inicio = f[0];
    if (f[1] > fin) fin = f[1];
  }
  return { inicio, fin };
}