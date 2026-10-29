/**
 * Total = subtotal menos descuento porcentual.
 * CORRECCIÓN: el descuento debe estar en el rango [0, 100].
 * La versión original no validaba el límite y un descuento negativo
 * aumentaba el total (100 con -20% daba 120).
 */
function calcularTotal(subtotal, descuentoPorcentaje = 0) {
  if (typeof subtotal !== "number" || !Number.isFinite(subtotal) || subtotal < 0) {
    throw new RangeError("El subtotal debe ser un número mayor o igual a 0");
  }
  if (
    typeof descuentoPorcentaje !== "number" ||
    Number.isNaN(descuentoPorcentaje) ||
    descuentoPorcentaje < 0 ||
    descuentoPorcentaje > 100
  ) {
    throw new RangeError("El descuento debe estar entre 0 y 100");
  }
  return Math.round(subtotal * (100 - descuentoPorcentaje)) / 100;
}

module.exports = { calcularTotal };
