const jwt = require("jsonwebtoken");

const SECRETO = process.env.JWT_SECRET;
if (!SECRETO) {
  throw new Error("ERROR CRÍTICO: JWT_SECRET no está definida en las variables de entorno.");
}

function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const [tipo, token] = cabecera.split(" ");
  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "falta el token" });
  }
  try {
    req.usuario = jwt.verify(token, SECRETO);
    next();
  } catch (e) {
    return res.status(401).json({ error: e.message });
  }
}

function exigirRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "no autenticado" });
    }
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "rol insuficiente" });
    }
    next();
  };
}

module.exports = { autenticar, exigirRol, SECRETO };
