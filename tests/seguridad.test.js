const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

const CLAVE_TEST = process.env.JWT_SECRET || "clave-secreta-para-pruebas-1234567890123456";

describe("Seguridad del Microservicio (Autenticación y Roles)", () => {
  let tokenUsuario;
  let tokenAdmin;

  beforeAll(() => {
    process.env.JWT_SECRET = CLAVE_TEST;
    tokenUsuario = jwt.sign(
      { sub: "u-100", nombre: "Ana Quispe", rol: "usuario" },
      CLAVE_TEST,
      { expiresIn: "15m", issuer: "practica11" }
    );
    tokenAdmin = jwt.sign(
      { sub: "u-001", nombre: "Docente", rol: "admin" },
      CLAVE_TEST,
      { expiresIn: "15m", issuer: "practica11" }
    );
  });

  describe("Autenticación (Middleware y 401)", () => {
    test("GET /tareas sin token responde 401 y falta el token", async () => {
      const res = await request(app).get("/tareas");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("falta el token");
    });

    test("GET /tareas con token válido responde 200", async () => {
      const res = await request(app)
        .get("/tareas")
        .set("Authorization", `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /tareas con token expirado responde 401 y jwt expired", async () => {
      const tokenVencido = jwt.sign(
        { sub: "u-100", rol: "usuario" },
        CLAVE_TEST,
        { expiresIn: "-10m" }
      );
      const res = await request(app)
        .get("/tareas")
        .set("Authorization", `Bearer ${tokenVencido}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("jwt expired");
    });

    test("GET /tareas con firma alterada responde 401 e invalid signature", async () => {
      const tokenAlterado = tokenUsuario.slice(0, -5) + "XXXXX";
      const res = await request(app)
        .get("/tareas")
        .set("Authorization", `Bearer ${tokenAlterado}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("invalid signature");
    });
  });

  describe("Autorización por Roles (403)", () => {
    test("DELETE /tareas/1 con rol 'usuario' responde 403 y rol insuficiente", async () => {
      const res = await request(app)
        .delete("/tareas/1")
        .set("Authorization", `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(403);
      expect(res.body.error).toBe("rol insuficiente");
    });

    test("DELETE /tareas/1 sin credenciales responde 401", async () => {
      const res = await request(app).delete("/tareas/1");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("falta el token");
    });

    test("DELETE /tareas/1 con rol 'admin' responde 204", async () => {
      const res = await request(app)
        .delete("/tareas/1")
        .set("Authorization", `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(204);
    });
  });
});
