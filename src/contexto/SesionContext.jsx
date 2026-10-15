import { createContext, useContext, useState } from "react";
import { ADMIN } from "../datos/admin.js";

const SesionContext = createContext(null);
export const CLAVE_USUARIOS = "usuariosAutoFacil";
export const CLAVE_SESION = "sesionAutoFacil";
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function leer(clave, defecto) {
  try {
    const valor = JSON.parse(localStorage.getItem(clave));
    return valor ?? defecto;
  } catch {
    return defecto;
  }
}

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const s = leer(CLAVE_SESION, null);
    if (!s || !s.correo) return null;
    if (s.correo === ADMIN.correo) return { nombre: ADMIN.nombre, correo: ADMIN.correo, rol: "admin" };
    const existe = leer(CLAVE_USUARIOS, []).find((u) => u.correo === s.correo);
    return existe ? { nombre: existe.nombre, correo: existe.correo, rol: "usuario" } : null;
  });
  const [modalAbierto, setModalAbierto] = useState(false);

  const esAdmin = usuario?.rol === "admin";

  function abrirSesion(u) {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: u.correo }));
    setUsuario(u);
    setModalAbierto(false);
  }

  // Devuelve un mensaje de error, o null si todo salió bien.
  function iniciarSesion(correo, clave) {
    const c = correo.trim().toLowerCase();
    if (!REGEX_CORREO.test(c)) return "Ingresa un correo electrónico válido.";
    if (!clave) return "Ingresa tu contraseña.";

    if (c === ADMIN.correo) {
      if (clave !== ADMIN.clave) return "Correo o contraseña incorrectos.";
      abrirSesion({ nombre: ADMIN.nombre, correo: ADMIN.correo, rol: "admin" });
      return null;
    }
    const encontrado = leer(CLAVE_USUARIOS, []).find((u) => u.correo === c && u.clave === clave);
    if (!encontrado) return "Correo o contraseña incorrectos.";
    abrirSesion({ nombre: encontrado.nombre, correo: encontrado.correo, rol: "usuario" });
    return null;
  }

  function registrarUsuario(nombre, correo, clave, confirmar) {
    const c = correo.trim().toLowerCase();
    if (nombre.trim().length < 2) return "Ingresa tu nombre.";
    if (!REGEX_CORREO.test(c)) return "Ingresa un correo electrónico válido.";
    if (clave.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (clave !== confirmar) return "Las contraseñas no coinciden.";
    if (c === ADMIN.correo) return "Ese correo está reservado.";

    const usuarios = leer(CLAVE_USUARIOS, []);
    if (usuarios.some((u) => u.correo === c)) return "Ya existe una cuenta con ese correo.";

    const nuevo = { nombre: nombre.trim(), correo: c, clave };
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([...usuarios, nuevo]));
    abrirSesion({ nombre: nuevo.nombre, correo: c, rol: "usuario" });
    return null;
  }

  function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
  }

  return (
    <SesionContext.Provider
      value={{ usuario, esAdmin, iniciarSesion, registrarUsuario, cerrarSesion, modalAbierto, setModalAbierto }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  return useContext(SesionContext);
}
