import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./componentes/Navbar.jsx";
import Footer from "./componentes/Footer.jsx";
import Inicio from "./paginas/Inicio.jsx";
import Vehiculos from "./paginas/Vehiculos.jsx";
import Nosotros from "./paginas/Nosotros.jsx";
import Contacto from "./paginas/Contacto.jsx";
import Comprar from "./paginas/Comprar.jsx";

const titulos = {
  "/": "AutoFacil | Automotora",
  "/vehiculos": "Vehículos | AutoFacil",
  "/nosotros": "Acerca de nosotros | AutoFacil",
  "/contacto": "Contacto | AutoFacil",
  "/comprar": "Comprar | AutoFacil",
};

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = titulos[pathname] || titulos["/"];
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="*" element={<Inicio />} />
      </Routes>
      <Footer />
    </>
  );
}
