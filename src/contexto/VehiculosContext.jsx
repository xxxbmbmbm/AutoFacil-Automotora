import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { formatearKilometraje } from "../api/cliente.js";
import { useSesion } from "./SesionContext.jsx";

const VehiculosContext = createContext(null);

// El backend envía el kilometraje como número; la interfaz lo muestra como "32.000 km".
const adaptar = (v) => ({ ...v, kilometrajeNumero: v.kilometraje, kilometraje: formatearKilometraje(v.kilometraje) });

export function VehiculosProvider({ children }) {
  const { api, esPersonal } = useSesion();
  const [vehiculos, setVehiculos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // La tienda solo muestra lo disponible; administrador y vendedor ven también lo vendido.
  const recargar = useCallback(async () => {
    try {
      const filtro = esPersonal ? "" : "?estado=DISPONIBLE";
      const [lista, tipos] = await Promise.all([
        api("vehiculos", "/vehiculos" + filtro),
        api("vehiculos", "/categorias"),
      ]);
      setVehiculos(lista.map(adaptar));
      setCategorias(tipos);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [api, esPersonal]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  // Devuelven un mensaje de error, o null si todo salió bien.
  async function agregarVehiculo(datos) {
    try {
      const nuevo = await api("vehiculos", "/vehiculos", { metodo: "POST", cuerpo: datos });
      setVehiculos((actuales) => [adaptar(nuevo), ...actuales]);
      return null;
    } catch (e) {
      return e.message;
    }
  }

  async function eliminarVehiculo(id) {
    try {
      await api("vehiculos", `/vehiculos/${id}`, { metodo: "DELETE" });
      setVehiculos((actuales) => actuales.filter((v) => v.id !== id));
      return null;
    } catch (e) {
      return e.message;
    }
  }

  return (
    <VehiculosContext.Provider
      value={{ vehiculos, categorias, cargando, error, recargar, agregarVehiculo, eliminarVehiculo }}
    >
      {children}
    </VehiculosContext.Provider>
  );
}

export function useVehiculos() {
  return useContext(VehiculosContext);
}
