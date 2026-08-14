export const TURNOS_POR_NEGOCIO = {
  1: [ // Restaurante
    { nombre: "Comida", inicio: "12:30", fin: "15:30" },
    { nombre: "Cena",   inicio: "20:00", fin: "23:00" },
  ],
};

export function obtenerTurnos(negocioId) {
  return TURNOS_POR_NEGOCIO[negocioId] || [];
}