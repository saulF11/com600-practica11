const PORCENTAJE_POR_TIPO = { regular: 0, frecuente: 5, vip: 10 };
const UMBRAL_BONO = 1000;
const BONO_POR_MONTO = 5;

/**
 * Descuento según el tipo de cliente, más un bono de 5 puntos
 * si el monto es mayor o igual a 1000.
 */
function calcularDescuento(monto, tipoCliente) {
  if (typeof monto !== "number" || !Number.isFinite(monto) || monto <= 0) {
    throw new RangeError("El monto debe ser un número mayor a 0");
  }
  if (!Object.hasOwn(PORCENTAJE_POR_TIPO, tipoCliente)) {
    throw new Error(`Tipo de cliente desconocido: ${tipoCliente}`);
  }

  let porcentaje = PORCENTAJE_POR_TIPO[tipoCliente];
  if (monto >= UMBRAL_BONO) porcentaje += BONO_POR_MONTO;

  const descuento = Math.round(monto * porcentaje) / 100;
  const total = Math.round((monto - descuento) * 100) / 100;

  return { porcentaje, descuento, total };
}

module.exports = { calcularDescuento };
