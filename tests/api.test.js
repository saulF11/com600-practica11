const request = require("supertest");
const { crearApp } = require("../src/app");

const AHORA = new Date("2026-10-08T12:00:00.000Z");

function crearRepositorioFalso() {
  const datos = new Map();
  return {
    guardar: jest.fn(async (tarea) => {
      datos.set(tarea.id, { ...tarea });
      return tarea;
    }),
    buscar: jest.fn(async () => [...datos.values()]),
  };
}

describe("API de tareas", () => {
  let repositorio;
  let publicador;
  let app;

  beforeEach(() => {
    repositorio = crearRepositorioFalso();
    publicador = jest.fn(async () => {});
    app = crearApp({ repositorio, publicador, reloj: () => AHORA });
  });

  describe("POST /tareas", () => {
    test("crea una tarea válida y responde 201 con su estado", async () => {
      const res = await request(app)
        .post("/tareas")
        .send({ titulo: "  Estudiar Jest  ", vence: "2026-10-08T18:00:00.000Z" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        titulo: "Estudiar Jest",
        completada: false,
        creadaEn: AHORA.toISOString(),
        estado: "por_vencer",
      });
      expect(typeof res.body.id).toBe("string");
      expect(repositorio.guardar).toHaveBeenCalledTimes(1);
    });

    test("crea una tarea sin fecha límite como 'pendiente'", async () => {
      const res = await request(app).post("/tareas").send({ titulo: "Sin fecha" });
      expect(res.status).toBe(201);
      expect(res.body.estado).toBe("pendiente");
      expect(res.body.vence).toBeUndefined();
    });

    test("publica el evento TareaCreada", async () => {
      const res = await request(app).post("/tareas").send({ titulo: "Evento" });
      expect(publicador).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: "TareaCreada",
          id: res.body.id,
          titulo: "Evento",
          creadaEn: AHORA.toISOString(),
        })
      );
    });

    test.each([{}, { titulo: "" }, { titulo: "   " }, { titulo: 123 }])(
      "responde 400 si el título es inválido: %p",
      async (cuerpo) => {
        const res = await request(app).post("/tareas").send(cuerpo);
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("El título es obligatorio");
        expect(repositorio.guardar).not.toHaveBeenCalled();
      }
    );

    test.each(["mañana", 123])("responde 400 si 'vence' es inválida: %p", async (vence) => {
      const res = await request(app).post("/tareas").send({ titulo: "X", vence });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("La fecha 'vence' no es válida");
    });

    test("responde 400 si el cuerpo no es JSON válido", async () => {
      const res = await request(app)
        .post("/tareas")
        .set("Content-Type", "application/json")
        .send("{malo");
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("JSON inválido");
    });

    test("responde 500 si el repositorio falla", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      repositorio.guardar.mockRejectedValueOnce(new Error("BD caída"));
      const res = await request(app).post("/tareas").send({ titulo: "Falla" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Error interno del servidor");
      spy.mockRestore();
    });
  });

  describe("GET /tareas", () => {
    test("devuelve una lista vacía si no hay tareas", async () => {
      const res = await request(app).get("/tareas");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test("devuelve las tareas creadas con su estado calculado", async () => {
      await request(app).post("/tareas").send({ titulo: "Una" });
      await request(app)
        .post("/tareas")
        .send({ titulo: "Dos", vence: "2026-10-08T13:00:00.000Z" });

      const res = await request(app).get("/tareas");
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body.map((t) => t.estado)).toEqual(["pendiente", "por_vencer"]);
    });

    test("responde 500 si el repositorio falla", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      repositorio.buscar.mockRejectedValueOnce(new Error("BD caída"));
      const res = await request(app).get("/tareas");
      expect(res.status).toBe(500);
      spy.mockRestore();
    });
  });

  describe("crearApp", () => {
    test("lanza error si no recibe repositorio", () => {
      expect(() => crearApp()).toThrow("Se requiere un repositorio");
    });

    test("funciona con el publicador y el reloj por defecto", async () => {
      const appPorDefecto = crearApp({ repositorio: crearRepositorioFalso() });
      const res = await request(appPorDefecto).post("/tareas").send({ titulo: "Defecto" });
      expect(res.status).toBe(201);
    });
  });
});
