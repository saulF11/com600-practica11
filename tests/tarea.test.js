const { estadoDeTarea } = require("../src/tarea");

const AHORA = new Date("2026-10-08T12:00:00.000Z");
const HORA = 60 * 60 * 1000;
const desdeAhora = (ms) => new Date(AHORA.getTime() + ms);

describe("estadoDeTarea", () => {
  describe("camino feliz", () => {
    test("una tarea completada devuelve 'completada' aunque ya haya vencido", () => {
      const tarea = { completada: true, vence: desdeAhora(-5 * HORA) };
      expect(estadoDeTarea(tarea, AHORA)).toBe("completada");
    });

    test("una tarea que vence en 3 días está 'pendiente'", () => {
      const tarea = { vence: desdeAhora(72 * HORA) };
      expect(estadoDeTarea(tarea, AHORA)).toBe("pendiente");
    });

    test("una tarea que vence en 2 horas está 'por_vencer'", () => {
      const tarea = { vence: desdeAhora(2 * HORA) };
      expect(estadoDeTarea(tarea, AHORA)).toBe("por_vencer");
    });

    test("una tarea que venció ayer está 'vencida'", () => {
      const tarea = { vence: desdeAhora(-24 * HORA) };
      expect(estadoDeTarea(tarea, AHORA)).toBe("vencida");
    });

    test("una tarea sin fecha límite está 'pendiente'", () => {
      expect(estadoDeTarea({ titulo: "Sin fecha" }, AHORA)).toBe("pendiente");
      expect(estadoDeTarea({ vence: null }, AHORA)).toBe("pendiente");
    });

    test("acepta fechas en formato ISO string", () => {
      const tarea = { vence: "2026-10-08T14:00:00.000Z" };
      expect(estadoDeTarea(tarea, AHORA)).toBe("por_vencer");
    });
  });

  describe("casos borde", () => {
    test("vence exactamente ahora → 'por_vencer' (todavía no está vencida)", () => {
      expect(estadoDeTarea({ vence: AHORA }, AHORA)).toBe("por_vencer");
    });

    test("vence en exactamente 24 h → 'por_vencer'", () => {
      expect(estadoDeTarea({ vence: desdeAhora(24 * HORA) }, AHORA)).toBe("por_vencer");
    });

    test("vence en 24 h + 1 ms → 'pendiente'", () => {
      expect(estadoDeTarea({ vence: desdeAhora(24 * HORA + 1) }, AHORA)).toBe("pendiente");
    });

    test("venció hace 1 ms → 'vencida'", () => {
      expect(estadoDeTarea({ vence: desdeAhora(-1) }, AHORA)).toBe("vencida");
    });

    test("sin segundo argumento usa la fecha actual del sistema", () => {
      expect(estadoDeTarea({ vence: "2000-01-01T00:00:00.000Z" })).toBe("vencida");
    });
  });

  describe("errores", () => {
    test.each([undefined, null, "texto", 42])(
      "lanza TypeError si la tarea es %p",
      (valor) => {
        expect(() => estadoDeTarea(valor, AHORA)).toThrow(TypeError);
        expect(() => estadoDeTarea(valor, AHORA)).toThrow("La tarea es obligatoria");
      }
    );

    test("lanza error si 'vence' no es una fecha válida", () => {
      expect(() => estadoDeTarea({ vence: "mañana" }, AHORA)).toThrow(
        "vence no es una fecha válida"
      );
    });

    test("lanza error si 'ahora' no es una fecha válida", () => {
      expect(() => estadoDeTarea({}, "no-es-fecha")).toThrow(
        "ahora no es una fecha válida"
      );
    });
  });
});
