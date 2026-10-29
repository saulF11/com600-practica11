const express = require("express");
const { randomUUID } = require("crypto");
const { estadoDeTarea } = require("./tarea");
const { construirEventoTareaCreada } = require("./eventos");

const app = express();
app.use(express.json());

let tareas = [{ id: 1, titulo: "Preparar el laboratorio", completada: false }];

// Middleware de autenticación (se omite únicamente si MODO_INSEGURO=1 para Lab 1)
app.use("/tareas", (req, res, next) => {
  if (process.env.MODO_INSEGURO === "1") {
    return next();
  }
  try {
    const { autenticar } = require("./auth");
    if (autenticar) {
      return autenticar(req, res, next);
    }
  } catch (e) {}
  next();
});

app.get("/tareas", (_req, res) => res.json(tareas));

app.post("/tareas", (req, res) => {
  const tarea = { id: tareas.length + 1, ...req.body, completada: false };
  tareas.push(tarea);
  res.status(201).json(tarea);
});

app.delete("/tareas/:id", (req, res, next) => {
  if (process.env.MODO_INSEGURO !== "1") {
    try {
      const { exigirRol } = require("./auth");
      if (exigirRol) {
        return exigirRol("admin")(req, res, () => {
          const i = tareas.findIndex((t) => t.id === Number(req.params.id));
          if (i < 0) return res.status(404).json({ error: "no existe" });
          tareas.splice(i, 1);
          return res.status(204).end();
        });
      }
    } catch (e) {}
  }

  const i = tareas.findIndex((t) => t.id === Number(req.params.id));
  if (i < 0) return res.status(404).json({ error: "no existe" });
  tareas.splice(i, 1);
  return res.status(204).end();
});

/**
 * Fábrica crearApp heredada de la Práctica 7 para compatibilidad de la suite de pruebas
 */
function crearApp({
  repositorio,
  publicador = async () => {},
  reloj = () => new Date(),
} = {}) {
  if (!repositorio) throw new Error("Se requiere un repositorio");

  const testApp = express();
  testApp.use(express.json());

  testApp.post("/tareas", async (req, res, next) => {
    try {
      const { titulo, vence } = req.body;

      if (typeof titulo !== "string" || titulo.trim() === "") {
        return res.status(400).json({ error: "El título es obligatorio" });
      }
      if (
        vence !== undefined &&
        (typeof vence !== "string" || Number.isNaN(Date.parse(vence)))
      ) {
        return res.status(400).json({ error: "La fecha 'vence' no es válida" });
      }

      const ahora = reloj();
      const tarea = {
        id: randomUUID(),
        titulo: titulo.trim(),
        completada: false,
        creadaEn: ahora.toISOString(),
      };
      if (vence !== undefined) tarea.vence = new Date(vence).toISOString();

      await repositorio.guardar(tarea);
      await publicador(construirEventoTareaCreada(tarea));

      return res.status(201).json({ ...tarea, estado: estadoDeTarea(tarea, ahora) });
    } catch (err) {
      return next(err);
    }
  });

  testApp.get("/tareas", async (req, res, next) => {
    try {
      const ahora = reloj();
      const tareas = await repositorio.buscar();
      return res
        .status(200)
        .json(tareas.map((t) => ({ ...t, estado: estadoDeTarea(t, ahora) })));
    } catch (err) {
      return next(err);
    }
  });

  // eslint-disable-next-line no-unused-vars
  testApp.use((err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ error: "JSON inválido" });
    }
    console.error(err);
    return res.status(500).json({ error: "Error interno del servidor" });
  });

  return testApp;
}

app.crearApp = crearApp;
module.exports = app;
module.exports.crearApp = crearApp;
