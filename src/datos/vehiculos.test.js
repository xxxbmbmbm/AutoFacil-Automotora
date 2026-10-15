import { describe, it, expect } from "vitest";
import { listaDeVehiculos, listaDeMarcas, formatearPrecioClp } from "./vehiculos.js";
import { ADMIN } from "./admin.js";

describe("formatearPrecioClp", () => {
  it("formatea con símbolo $ y puntos de miles", () => {
    expect(formatearPrecioClp(8990000)).toBe("$8.990.000");
    expect(formatearPrecioClp(0)).toBe("$0");
    expect(formatearPrecioClp(1500)).toBe("$1.500");
  });
});

describe("catálogo base", () => {
  it("tiene vehículos con los campos requeridos e ids únicos", () => {
    expect(listaDeVehiculos.length).toBeGreaterThan(0);
    const ids = listaDeVehiculos.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const v of listaDeVehiculos) {
      for (const campo of ["marca", "modelo", "anio", "tipo", "precio", "kilometraje", "transmision", "imagen", "colorFondo"]) {
        expect(v).toHaveProperty(campo);
      }
      expect(v.precioAnterior === null || v.precioAnterior > v.precio).toBe(true);
    }
  });

  it("lista de marcas no vacía y sin repetidos", () => {
    expect(listaDeMarcas.length).toBeGreaterThan(0);
    expect(new Set(listaDeMarcas).size).toBe(listaDeMarcas.length);
  });
});

describe("administrador reservado", () => {
  it("define credenciales y rol admin", () => {
    expect(ADMIN.rol).toBe("admin");
    expect(ADMIN.correo).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(ADMIN.clave.length).toBeGreaterThanOrEqual(6);
  });
});
