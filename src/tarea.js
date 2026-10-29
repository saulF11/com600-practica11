const MS_POR_DIA = 24 * 60 * 60 * 1000;

function aFecha(valor, nombre) {
  const fecha = valor instanceof Date ? valor : new Date(valor);
  if (Number.isNaN(fecha.getTime())) {
    throw new Error(`${nombre} no es una fecha válida`);
  }
  return fecha;
}

/**
 * Regla de negocio: estado de una tarea en un instante dado.
 *  - "completada": tarea.completada === true (tiene prioridad sobre todo)
 *  - "pendiente":  sin fecha límite, o falta más de 24 h
 *  - "por_vencer": faltan 24 h o menos (incluye el instante exacto del vencimiento)
 *  - "vencida":    la fecha límite ya pasó
 * `ahora` se recibe por parámetro para que la función sea determinista.
 */
function estadoDeTarea(tarea, ahora = new Date()) {
  if (!tarea || typeof tarea !== "object") {
    throw new TypeError("La tarea es obligatoria");
  }
  const referencia = aFecha(ahora, "ahora");

  if (tarea.completada === true) return "completada";
  if (tarea.vence === undefined || tarea.vence === null) return "pendiente";

  const vence = aFecha(tarea.vence, "vence");
  const diferencia = vence.getTime() - referencia.getTime();

  if (diferencia < 0) return "vencida";
  if (diferencia <= MS_POR_DIA) return "por_vencer";
  return "pendiente";
}

module.exports = { estadoDeTarea };
