import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useSesion } from "../contexto/SesionContext.jsx";
import { useTema } from "../contexto/TemaContext.jsx";
import ModalSesion from "./ModalSesion.jsx";
import Icono from "./Icono.jsx";

const tienda = [
  { a: "/", texto: "Inicio" },
  { a: "/vehiculos", texto: "Vehículos" },
  { a: "/nosotros", texto: "Acerca de nosotros" },
  { a: "/contacto", texto: "Contacto" },
];

// Cada rol ve solo los enlaces que puede usar. El vendedor no ve nada más que vehículos y órdenes.
function enlacesSegunRol(rol) {
  if (rol === "VENDEDOR") return [{ a: "/vehiculos", texto: "Vehículos" }, { a: "/ordenes", texto: "Órdenes" }];
  if (rol === "ADMIN") return [...tienda, { a: "/ordenes", texto: "Órdenes" }, { a: "/usuarios", texto: "Usuarios" }];
  if (rol === "CLIENTE") return [...tienda, { a: "/mis-compras", texto: "Mis compras" }];
  return tienda;
}

const NOMBRE_ROL = { ADMIN: "Admin", VENDEDOR: "Vendedor" };
const SEGUNDOS_ENTRE_CONSULTAS = 60;
export const EVENTO_BANDEJA = "bandeja-actualizada";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const { usuario, rol, esAdmin, api, cerrarSesion, setModalAbierto } = useSesion();
  const { tema, alternarTema } = useTema();
  const { pathname } = useLocation();
  const [nuevas, setNuevas] = useState(0);

  // Notificaciones del administrador: cuántas solicitudes de contacto están sin atender.
  useEffect(() => {
    if (!esAdmin) return;
    const consultar = () => api("contacto", "/contactos/resumen").then((r) => setNuevas(r.nuevas)).catch(() => {});
    consultar();
    const intervalo = setInterval(consultar, SEGUNDOS_ENTRE_CONSULTAS * 1000);
    window.addEventListener(EVENTO_BANDEJA, consultar); // la bandeja avisa cuando cambia algo
    return () => {
      clearInterval(intervalo);
      window.removeEventListener(EVENTO_BANDEJA, consultar);
    };
  }, [esAdmin, api, pathname]);

  return (
    <>
      <nav className="navbar navbar-expand-lg barra-navegacion sticky-top">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <img src="/images/logo.png" alt="Logo AutoFacil" />
          </Link>
          <button className="navbar-toggler" type="button" aria-label="Abrir menú" onClick={() => setAbierto(!abierto)}>
            <Icono nombre="menu" />
          </button>
          <div className={"collapse navbar-collapse" + (abierto ? " show" : "")}>
            <ul className="navbar-nav me-auto gap-lg-1">
              {enlacesSegunRol(rol).map((e) => (
                <li className="nav-item" key={e.a}>
                  <NavLink to={e.a} end className="nav-link enlace-menu-principal" onClick={() => setAbierto(false)}>
                    {e.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ul className="navbar-nav align-items-lg-center gap-2">
              {esAdmin && (
                <li className="nav-item">
                  <NavLink
                    to="/bandeja"
                    className="nav-link boton-campana"
                    aria-label={`Bandeja de contacto: ${nuevas} solicitudes nuevas`}
                    onClick={() => setAbierto(false)}
                  >
                    <Icono nombre="campana" tamano={18} />
                    {nuevas > 0 && <span className="contador-notificaciones">{nuevas}</span>}
                  </NavLink>
                </li>
              )}
              <li className="nav-item">
                <button
                  type="button"
                  className="boton-tema"
                  onClick={alternarTema}
                  aria-label="Cambiar entre modo claro y oscuro"
                  title={tema === "claro" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
                >
                  <Icono nombre={tema === "claro" ? "luna" : "sol"} tamano={16} />
                  {tema === "claro" ? "Oscuro" : "Claro"}
                </button>
              </li>
              {usuario ? (
                <li className="nav-item d-flex align-items-center gap-3">
                  <span className="saludo-usuario">
                    <Icono nombre="usuario" tamano={16} />
                    {usuario.nombre}
                    {NOMBRE_ROL[rol] && <span className="insignia-admin">{NOMBRE_ROL[rol]}</span>}
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
                    Iniciar sesión
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
