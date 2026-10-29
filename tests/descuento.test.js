const { calcularDescuento } = require("../src/descuento");

describe("calcularDescuento (regla de negocio propia - Ejercicio 1)", () => {
  test("1. cliente regular no recibe descuento", () => {
    expect(calcularDescuento(200, "regular")).toEqual({ porcentaje: 0, descuento: 0, total: 200 });
  });

  test("2. cliente frecuente recibe 5 %", () => {
    expect(calcularDescuento(200, "frecuente")).toEqual({ porcentaje: 5, descuento: 10, total: 190 });
  });

  test("3. cliente vip recibe 10 %", () => {
    expect(calcularDescuento(200, "vip")).toEqual({ porcentaje: 10, descuento: 20, total: 180 });
  });

  test("4. el bono de 5 puntos aplica desde 1000 exactos y no en 999.99 (valor límite)", () => {
    expect(calcularDescuento(999.99, "regular").porcentaje).toBe(0);
    expect(calcularDescuento(1000, "regular")).toEqual({ porcentaje: 5, descuento: 50, total: 950 });
  });

  test("5. vip con monto alto acumula 15 % y redondea a 2 decimales", () => {
    expect(calcularDescuento(1234.56, "vip")).toEqual({
      porcentaje: 15,
      descuento: 185.18,
      total: 1049.38,
    });
  });

  test("6. rechaza montos inválidos y tipos de cliente desconocidos", () => {
    expect(() => calcularDescuento(0, "vip")).toThrow(RangeError);
    expect(() => calcularDescuento(-50, "vip")).toThrow("mayor a 0");
    expect(() => calcularDescuento("100", "vip")).toThrow(RangeError);
    expect(() => calcularDescuento(NaN, "vip")).toThrow(RangeError);
    expect(() => calcularDescuento(100, "platino")).toThrow("Tipo de cliente desconocido: platino");
    expect(() => calcularDescuento(100, "toString")).toThrow("Tipo de cliente desconocido");
  });
});
