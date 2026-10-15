import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { VehiculosProvider, useVehiculos, CLAVE_VEHICULOS } from "./VehiculosContext.jsx";
import { listaDeVehiculos } from "../datos/vehiculos.js";

const montar = () => renderHook(() => useVehiculos(), { wrapper: VehiculosProvider });
const nuevo = { marca: "Kia", modelo: "Rio", anio: 2024, tipo: "Sedán", precio: 1000, precioAnterior: null,
  kilometraje: "0 km", transmision: "Mecánica", imagen: "/x.png", colorFondo: "#000000" };

describe("VehiculosContext", () => {
  it("parte con el catálogo base", () => {
    expect(montar().result.current.vehiculos).toEqual(listaDeVehiculos);
  });

  it("carga el catálogo guardado", () => {
    localStorage.setItem(CLAVE_VEHICULOS, JSON.stringify([{ ...nuevo, id: 5 }]));
    expect(montar().result.current.vehiculos).toHaveLength(1);
  });

  it("usa el catálogo base si lo guardado está corrupto o no es una lista", () => {
    localStorage.setItem(CLAVE_VEHICULOS, "{roto");
    expect(montar().result.current.vehiculos).toEqual(listaDeVehiculos);
    localStorage.setItem(CLAVE_VEHICULOS, JSON.stringify({ a: 1 }));
    expect(montar().result.current.vehiculos).toEqual(listaDeVehiculos);
  });

  it("agrega un vehículo al inicio con id incremental y lo persiste", () => {
    const { result } = montar();
    const maxId = Math.max(...listaDeVehiculos.map((v) => v.id));
    act(() => result.current.agregarVehiculo(nuevo));
    expect(result.current.vehiculos[0]).toMatchObject({ marca: "Kia", id: maxId + 1 });
    expect(result.current.vehiculos).toHaveLength(listaDeVehiculos.length + 1);
    expect(JSON.parse(localStorage.getItem(CLAVE_VEHICULOS))).toHaveLength(listaDeVehiculos.length + 1);
  });

  it("asigna id 1 cuando el catálogo está vacío", () => {
    localStorage.setItem(CLAVE_VEHICULOS, "[]");
    const { result } = montar();
    act(() => result.current.agregarVehiculo(nuevo));
    expect(result.current.vehiculos[0].id).toBe(1);
  });

  it("elimina un vehículo por id", () => {
    const { result } = montar();
    act(() => result.current.eliminarVehiculo(listaDeVehiculos[0].id));
    expect(result.current.vehiculos.find((v) => v.id === listaDeVehiculos[0].id)).toBeUndefined();
    expect(result.current.vehiculos).toHaveLength(listaDeVehiculos.length - 1);
  });

  it("restablece el catálogo original", () => {
    const { result } = montar();
    act(() => result.current.eliminarVehiculo(listaDeVehiculos[0].id));
    act(() => result.current.restablecerCatalogo());
    expect(result.current.vehiculos).toEqual(listaDeVehiculos);
  });
});
