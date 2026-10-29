const { calcularTotal } = require("../src/total");

// Versión ORIGINAL (defectuosa), conservada solo para documentar el fallo:
// no validaba el rango del descuento.
function calcularTotalDefectuoso(subtotal, descuentoPorcentaje) {
  return subtotal - subtotal * (descuentoPorcentaje / 100);
}

describe("calcularTotal (Ejercicio 2 - corrección del límite de descuento)", () => {
  describe("demostración de la falla (prueba en ROJO sobre la versión original)", () => {
    test("la versión original INFLABA el total con un descuento negativo", () => {
      const total = calcularTotalDefectuoso(100, -20);
      expect(total).toBe(120); // un "descuento" que cobra más: el defecto
      expect(total).toBeGreaterThan(100);
    });

    test("la versión original aceptaba descuentos mayores a 100 y daba total negativo", () => {
      expect(calcularTotalDefectuoso(100, 150)).toBe(-50);
    });
  });

  describe("verificación de la corrección (prueba en VERDE)", () => {
    test("un descuento negativo es rechazado y nunca aumenta el total", () => {
      expect(() => calcularTotal(100, -20)).toThrow(RangeError);
      expect(() => calcularTotal(100, -20)).toThrow("entre 0 y 100");
    });

    test("un descuento mayor a 100 es rechazado", () => {
      expect(() => calcularTotal(100, 150)).toThrow(RangeError);
      expect(() => calcularTotal(100, 100.01)).toThrow(RangeError);
    });

    test("los límites 0 y 100 son válidos", () => {
      expect(calcularTotal(200, 0)).toBe(200);
      expect(calcularTotal(200, 100)).toBe(0);
    });

    test("caso normal: 25 % sobre 200 da 150", () => {
      expect(calcularTotal(200, 25)).toBe(150);
    });

    test("sin descuento devuelve el subtotal", () => {
      expect(calcularTotal(99.99)).toBe(99.99);
    });

    test("el total nunca supera el subtotal para ningún descuento válido", () => {
      for (const d of [0, 1, 10, 50, 99, 100]) {
        expect(calcularTotal(100, d)).toBeLessThanOrEqual(100);
      }
    });

    test("valida subtotal y tipo del descuento", () => {
      expect(() => calcularTotal(-1, 10)).toThrow("subtotal");
      expect(() => calcularTotal("100", 10)).toThrow(RangeError);
      expect(() => calcularTotal(100, NaN)).toThrow(RangeError);
      expect(() => calcularTotal(100, "10")).toThrow(RangeError);
    });
  });
});
