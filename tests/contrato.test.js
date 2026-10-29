const contrato = require("../contratos/tarea-creada.contrato.json");
const { construirEventoTareaCreada } = require("../src/eventos");

/**
 * Validador mínimo del contrato (campos obligatorios y tipos),
 * sin dependencias extra. Devuelve la lista de errores encontrados.
 */
function validarContrato(evento, esquema) {
  const errores = [];

  for (const campo of esquema.required) {
    if (evento[campo] === undefined) {
      errores.push(`Falta el campo obligatorio "${campo}"`);
    }
  }

  for (const [campo, def] of Object.entries(esquema.properties)) {
    const valor = evento[campo];
    if (valor === undefined) continue;

    const tipoOk = def.type === "integer" ? Number.isInteger(valor) : typeof valor === def.type;
    if (!tipoOk) {
      errores.push(`"${campo}" debe ser de tipo ${def.type}`);
    } else if (def.minLength && valor.length < def.minLength) {
      errores.push(`"${campo}" no puede estar vacío`);
    } else if (def.format === "date-time" && Number.isNaN(Date.parse(valor))) {
      errores.push(`"${campo}" debe ser una fecha-hora ISO válida`);
    } else if (def.const !== undefined && valor !== def.const) {
      errores.push(`"${campo}" debe valer ${def.const}`);
    }
  }
  return errores;
}

// Consumidor simulado: usa SOLO los campos que el contrato promete.
function consumidorNotificaciones(evento) {
  return { idTarea: evento.id, mensaje: `Nueva tarea: ${evento.titulo} (${evento.creadaEn})` };
}

const tarea = { id: "t-1", titulo: "Estudiar", creadaEn: "2026-10-08T12:00:00.000Z" };

describe("contrato TareaCreada", () => {
  test("el contrato declara id, titulo y creadaEn como obligatorios y de tipo string", () => {
    expect(contrato.required).toEqual(["id", "titulo", "creadaEn"]);
    expect(contrato.properties.id.type).toBe("string");
    expect(contrato.properties.titulo.type).toBe("string");
    expect(contrato.properties.creadaEn.type).toBe("string");
  });

  describe("lado proveedor", () => {
    test("el evento construido cumple el contrato", () => {
      const evento = construirEventoTareaCreada(tarea);
      expect(validarContrato(evento, contrato)).toEqual([]);
      expect(evento.tipo).toBe("TareaCreada");
    });

    test("convierte creadaEn de Date a string ISO", () => {
      const evento = construirEventoTareaCreada({ ...tarea, creadaEn: new Date(tarea.creadaEn) });
      expect(evento.creadaEn).toBe("2026-10-08T12:00:00.000Z");
      expect(validarContrato(evento, contrato)).toEqual([]);
    });

    test("lanza error si la tarea no tiene los datos mínimos", () => {
      expect(() => construirEventoTareaCreada(null)).toThrow("datos mínimos");
      expect(() => construirEventoTareaCreada({ id: "x" })).toThrow("datos mínimos");
    });

    test("detecta un evento sin creadaEn (cambio que rompe el contrato)", () => {
      const evento = construirEventoTareaCreada({ id: "t-1", titulo: "Sin fecha" });
      expect(validarContrato(evento, contrato)).toContain('Falta el campo obligatorio "creadaEn"');
    });

    test("detecta un cambio de tipo en un campo (id numérico)", () => {
      const evento = { ...construirEventoTareaCreada(tarea), id: 123 };
      expect(validarContrato(evento, contrato)).toContain('"id" debe ser de tipo string');
    });

    test("detecta fecha inválida, título vacío, tipo y versión incorrectos", () => {
      const evento = {
        ...construirEventoTareaCreada(tarea),
        creadaEn: "ayer",
        titulo: "",
        tipo: "OtroEvento",
        version: "uno",
      };
      const errores = validarContrato(evento, contrato);
      expect(errores).toEqual(
        expect.arrayContaining([
          '"creadaEn" debe ser una fecha-hora ISO válida',
          '"titulo" no puede estar vacío',
          '"tipo" debe valer TareaCreada',
          '"version" debe ser de tipo integer',
        ])
      );
    });

    test("agregar campos nuevos NO rompe el contrato (compatibilidad hacia atrás)", () => {
      const evento = { ...construirEventoTareaCreada(tarea), prioridad: "alta" };
      expect(validarContrato(evento, contrato)).toEqual([]);
    });
  });

  describe("lado consumidor", () => {
    test("el consumidor procesa un evento que cumple el contrato", () => {
      const evento = construirEventoTareaCreada(tarea);
      expect(validarContrato(evento, contrato)).toEqual([]);
      expect(consumidorNotificaciones(evento)).toEqual({
        idTarea: "t-1",
        mensaje: "Nueva tarea: Estudiar (2026-10-08T12:00:00.000Z)",
      });
    });

    test("el consumidor también funciona con campos extra desconocidos", () => {
      const evento = { ...construirEventoTareaCreada(tarea), campoNuevo: true };
      expect(consumidorNotificaciones(evento).idTarea).toBe("t-1");
    });
  });
});
