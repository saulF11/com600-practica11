require("dotenv").config();
const jwt = require("jsonwebtoken");
// Clave FICTICIA de laboratorio. En el Lab 5 sale del codigo.
const SECRETO = process.env.JWT_SECRET || "clave-ficticia-de-aula-no-usar";
const carga = { sub: "u-100", nombre: "Ana Quispe", rol: "usuario" };
const token = jwt.sign(carga, SECRETO, {
  expiresIn: "15m",
  issuer: "practica11",
});
console.log(token);
