import { createContext, useContext, useEffect, useState } from "react";
import { listaDeVehiculos } from "../datos/vehiculos.js";

const VehiculosContext = createContext(null);
export const CLAVE_VEHICULOS = "vehiculosAutoFacil";

export function VehiculosProvider({ children }) {
  const [vehiculos, setVehiculos] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem(CLAVE_VEHICULOS));
      return Array.isArray(guardados) ? guardados : listaDeVehiculos;
    } catch {
      return listaDeVehiculos;
    }
  });

  useEffect(() => {
    localStorage.setItem(CLAVE_VEHICULOS, JSON.stringify(vehiculos));
  }, [vehiculos]);

  function agregarVehiculo(datos) {
    setVehiculos((actuales) => {
      const id = actuales.reduce((max, v) => Math.max(max, v.id), 0) + 1;
      return [{ ...datos, id }, ...actuales];
    });
  }

  function eliminarVehiculo(id) {
    setVehiculos((actuales) => actuales.filter((v) => v.id !== id));
  }

  function restablecerCatalogo() {
    setVehiculos(listaDeVehiculos);
  }

  return (
    <VehiculosContext.Provider value={{ vehiculos, agregarVehiculo, eliminarVehiculo, restablecerCatalogo }}>
      {children}
    </VehiculosContext.Provider>
  );
}

export function useVehiculos() {
  return useContext(VehiculosContext);
}
