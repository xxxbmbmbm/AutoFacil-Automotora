import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useSesion } from "../contexto/SesionContext.jsx";
import { useTema } from "../contexto/TemaContext.jsx";
import ModalSesion from "./ModalSesion.jsx";

const enlaces = [
  { a: "/", texto: "Inicio" },
  { a: "/vehiculos", texto: "Vehículos" },
  { a: "/nosotros", texto: "Acerca de nosotros" },
  { a: "/contacto", texto: "Contacto" },
];

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const { usuario, esAdmin, cerrarSesion, setModalAbierto } = useSesion();
  const { tema, alternarTema } = useTema();

  return (
    <>
      <nav className="navbar navbar-expand-lg barra-navegacion sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/images/logo.png" alt="Logo AutoFacil" />
          </Link>
          <button className="navbar-toggler" type="button" aria-label="Abrir menú" onClick={() => setAbierto(!abierto)}>
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={"collapse navbar-collapse" + (abierto ? " show" : "")}>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              {enlaces.map((e) => (
                <li className="nav-item" key={e.a}>
                  <NavLink to={e.a} end className="nav-link enlace-menu-principal" onClick={() => setAbierto(false)}>
                    {e.texto}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item ms-lg-2">
                <button
                  type="button"
                  className="boton-tema"
                  onClick={alternarTema}
                  aria-label="Cambiar entre modo claro y oscuro"
                  title={tema === "claro" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                >
                  {tema === "claro" ? "🌙 Oscuro" : "☀️ Claro"}
                </button>
              </li>
              {usuario ? (
                <li className="nav-item d-flex align-items-center gap-2">
                  <span className="saludo-usuario">
                    👤 {usuario.nombre}
                    {esAdmin && <span className="insignia-admin">Admin</span>}
                  </span>
                  <button
                    type="button"
                    className="nav-link boton-sesion"
                    onClick={() => { setAbierto(false); cerrarSesion(); }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              ) : (
                <li className="nav-item">
                  <button
                    type="button"
                    className="nav-link boton-sesion"
                    onClick={() => { setAbierto(false); setModalAbierto(true); }}
                  >
                    👤 Iniciar sesión
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <ModalSesion />
    </>
  );
}
