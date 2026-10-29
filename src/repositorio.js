const { MongoClient } = require("mongodb");

class RepositorioTareas {
  constructor(cliente, coleccion) {
    this.cliente = cliente;
    this.coleccion = coleccion;
  }

  static async conectar(uri, nombreBd = "tareas_db", opciones = {}) {
    const cliente = new MongoClient(uri, { driverInfo: { name: "nodejs", version: "6.8.0" }, ...opciones });
    await cliente.connect();
    return new RepositorioTareas(cliente, cliente.db(nombreBd).collection("tareas"));
  }

  async guardar(tarea) {
    // Se copia el objeto: insertOne agrega _id al documento recibido.
    await this.coleccion.insertOne({ ...tarea });
    return tarea;
  }

  async buscarPorId(id) {
    return this.coleccion.findOne({ id }, { projection: { _id: 0 } });
  }

  async buscar(filtro = {}) {
    return this.coleccion.find(filtro, { projection: { _id: 0 } }).toArray();
  }

  async actualizar(id, cambios) {
    return this.coleccion.findOneAndUpdate(
      { id },
      { $set: cambios },
      { returnDocument: "after", projection: { _id: 0 } }
    );
  }

  async eliminar(id) {
    const resultado = await this.coleccion.deleteOne({ id });
    return resultado.deletedCount === 1;
  }

  async limpiar() {
    await this.coleccion.deleteMany({});
  }

  async cerrar() {
    await this.cliente.close();
  }
}

module.exports = { RepositorioTareas };
