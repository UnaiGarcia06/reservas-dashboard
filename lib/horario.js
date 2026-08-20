const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

function claveDia(fecha) {
  const fechaObj = new Date(fecha + "T00:00:00");
  return DIAS[fechaObj.getDay()];
}

function idDiaSemana(fecha) {
  const fechaObj = new Date(fecha + "T00:00:00");
  return fechaObj.getDay(); // 0=domingo ... 6=sábado (misma convención que dias_semanales_cerrados)
}

/**
 * Franja de apertura de un día concreto, sin tener en cuenta excepciones.
 * Se mantiene tal cual para no romper nada que ya la use.
 */
export function obtenerFranjaDelDia(horario, fecha) {
  const diaKey = claveDia(fecha);
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

/**
 * Estado real de un día concreto teniendo en cuenta:
 * 1. Fechas especiales (cierran o abren ese día en concreto, tienen prioridad máxima).
 * 2. Cierre semanal habitual (dias_semanales_cerrados).
 * 3. Horario semanal normal configurado.
 *
 * Devuelve { cerrado: boolean, franjas: [[inicio, fin], ...] }
 */
export function obtenerEstadoDia(horario, calendarioExcepciones, fecha) {
  const especial = calendarioExcepciones?.fechas_especiales?.find((f) => f.fecha === fecha);

  if (especial?.cerrado) {
    return { cerrado: true, franjas: [] };
  }

  const diaId = idDiaSemana(fecha);
  const cerradoSemanal = (calendarioExcepciones?.dias_semanales_cerrados || []).includes(diaId);

  // Si hay una apertura especial ese día, ignoramos el cierre semanal habitual.
  if (cerradoSemanal && !especial) {
    return { cerrado: true, franjas: [] };
  }

  const diaKey = claveDia(fecha);
  const config = horario?.[diaKey];
  const franjas = config?.abierto && Array.isArray(config.franjas) ? config.franjas : [];

  if (franjas.length === 0) {
    return { cerrado: true, franjas: [] };
  }

  return { cerrado: false, franjas };
}

/**
 * Rango de horas más amplio que el negocio abre en toda la semana.
 * Se usa como límites del eje de horas del calendario, para que la rejilla
 * no cambie de tamaño según el día que se esté viendo.
 * Devuelve null si no hay ninguna franja configurada en toda la semana.
 */
export function calcularFranjaVisible(horario) {
  let inicio = null;
  let fin = null;

  for (const dia of DIAS) {
    const config = horario?.[dia];
    if (!config?.abierto || !Array.isArray(config.franjas)) continue;
    for (const [ini, f] of config.franjas) {
      if (!ini || !f) continue;
      if (inicio === null || ini < inicio) inicio = ini;
      if (fin === null || f > fin) fin = f;
    }
  }

  if (inicio === null || fin === null) return null;
  return { inicio, fin };
}

/**
 * Dado el rango visible del calendario y las franjas abiertas de un día concreto,
 * calcula los tramos "cerrados" (el complementario) para pintarlos en gris.
 */
export function calcularBandasCerradas(franjaVisible, franjasAbiertas) {
  if (!franjaVisible) return [];
  const { inicio, fin } = franjaVisible;

  if (!franjasAbiertas || franjasAbiertas.length === 0) {
    return [[inicio, fin]];
  }

  const ordenadas = [...franjasAbiertas]
    .filter((f) => f[0] && f[1])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

  const bandas = [];
  let cursor = inicio;
  for (const [ini, f] of ordenadas) {
    if (ini > cursor) bandas.push([cursor, ini]);
    if (f > cursor) cursor = f;
  }
  if (cursor < fin) bandas.push([cursor, fin]);

  return bandas;
}