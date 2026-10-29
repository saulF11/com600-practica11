require("dotenv").config();
const fs = require("fs");
const https = require("https");
const app = require("./app");

const opciones = {
  key: fs.readFileSync("certs/servidor.key"),
  cert: fs.readFileSync("certs/servidor.crt"),
};

https.createServer(opciones, app).listen(3443, () => {
  console.log("Servidor HTTPS escuchando en https://localhost:3443");
});
