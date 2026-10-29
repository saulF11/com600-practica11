function construirEventoTareaCreada(tarea) {
  if (!tarea || !tarea.id || !tarea.titulo) {
    throw new Error(
      "La tarea no tiene los datos mínimos (id, titulo) para construir el evento"
    );
  }
  const creadaEn =
    tarea.creadaEn instanceof Date ? tarea.creadaEn.toISOString() : tarea.creadaEn;

  return {
    tipo: "TareaCreada",
    version: 1,
    id: tarea.id,
    titulo: tarea.titulo,
    creadaEn,
  };
}

module.exports = { construirEventoTareaCreada };
