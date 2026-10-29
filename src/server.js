require("dotenv").config();
require("./auth");
const app = require("./app");

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servicio de tareas escuchando en http://localhost:${PUERTO}`);
});
