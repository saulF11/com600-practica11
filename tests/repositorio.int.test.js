const { RepositorioTareas } = require("../src/repositorio");

describe("RepositorioTareas (integración con MongoDB)", () => {
  let repo;

  beforeAll(async () => {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/test_db_int?directConnection=true";
    repo = await RepositorioTareas.conectar(uri, "test_db_int");
  }, 30000);

  afterAll(async () => {
    if (repo) await repo.cerrar();
  }, 30000);

  beforeEach(async () => {
    if (repo) await repo.limpiar();
  });

  test("la colección está vacía al iniciar cada prueba", async () => {
    const tareas = await repo.buscar();
    expect(tareas).toEqual([]);
  });

  test("CREAR: guarda una tarea y se puede recuperar por id", async () => {
    const creada = await repo.guardar({ id: "t1", titulo: "Prueba Mongo" });
    expect(creada.id).toBe("t1");

    const buscada = await repo.buscarPorId("t1");
    expect(buscada.titulo).toBe("Prueba Mongo");
  });

  test("LEER: busca todas las tareas y filtra por campo", async () => {
    await repo.guardar({ id: "t1", titulo: "Tarea A", completada: true });
    await repo.guardar({ id: "t2", titulo: "Tarea B", completada: false });

    const completadas = await repo.buscar({ completada: true });
    expect(completadas.length).toBe(1);
    expect(completadas[0].titulo).toBe("Tarea A");
  });

  test("ACTUALIZAR: modifica campos y devuelve el documento actualizado", async () => {
    await repo.guardar({ id: "t1", titulo: "Original" });
    const actualizada = await repo.actualizar("t1", { titulo: "Modificado" });

    expect(actualizada.titulo).toBe("Modificado");
  });

  test("ELIMINAR: borra la tarea y deja de encontrarse", async () => {
    await repo.guardar({ id: "t1", titulo: "A borrar" });
    const borrado = await repo.eliminar("t1");

    expect(borrado).toBe(true);
    const buscada = await repo.buscarPorId("t1");
    expect(buscada).toBeNull();
  });
});
