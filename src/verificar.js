require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRETO = process.env.JWT_SECRET || "clave-ficticia-de-aula-no-usar";
try {
  console.log("VALIDO:", jwt.verify(process.argv[2], SECRETO));
} catch (e) {
  console.log("RECHAZADO:", e.name, "-", e.message);
}
