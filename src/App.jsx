import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./componentes/Navbar.jsx";
import Footer from "./componentes/Footer.jsx";
import RutaProtegida from "./componentes/RutaProtegida.jsx";
import Inicio from "./paginas/Inicio.jsx";
import Vehiculos from "./paginas/Vehiculos.jsx";
import DetalleVehiculo from "./paginas/DetalleVehiculo.jsx";
import Nosotros from "./paginas/Nosotros.jsx";
import Contacto from "./paginas/Contacto.jsx";
import Comprar from "./paginas/Comprar.jsx";
import Ordenes from "./paginas/Ordenes.jsx";
import Bandeja from "./paginas/Bandeja.jsx";
import Usuarios from "./paginas/Usuarios.jsx";

const titulos = {
  "/": "AutoFacil | Automotora",
  "/vehiculos": "Vehículos | AutoFacil",
  "/nosotros": "Acerca de nosotros | AutoFacil",
  "/contacto": "Contacto | AutoFacil",
  "/comprar": "Comprar | AutoFacil",
  "/ordenes": "Órdenes | AutoFacil",
  "/mis-compras": "Mis compras | AutoFacil",
  "/bandeja": "Bandeja de contacto | AutoFacil",
  "/usuarios": "Usuarios | AutoFacil",
};

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    const esDetalle = pathname.startsWith("/vehiculos/");
    document.title = titulos[pathname] || (esDetalle ? "Detalle del vehículo | AutoFacil" : titulos["/"]);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculos/:id" element={<DetalleVehiculo />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route
          path="/ordenes"
          element={<RutaProtegida roles={["ADMIN", "VENDEDOR"]}><Ordenes /></RutaProtegida>}
        />
        <Route
          path="/mis-compras"
          element={<RutaProtegida roles={["CLIENTE", "ADMIN"]}><Ordenes propias /></RutaProtegida>}
        />
        <Route path="/bandeja" element={<RutaProtegida roles={["ADMIN"]}><Bandeja /></RutaProtegida>} />
        <Route path="/usuarios" element={<RutaProtegida roles={["ADMIN"]}><Usuarios /></RutaProtegida>} />
        <Route path="*" element={<Inicio />} />
      </Routes>
      <Footer />
    </>
  );
}
