import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { ErrorApi, llamarApi } from "../api/cliente.js";

const SesionContext = createContext(null);
export const CLAVE_SESION = "sesionAutoFacil";
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// La sesión guardada es { tokenAcceso, tokenRenovacion, usuario }.
// Va en localStorage para sobrevivir a recargas de página. El token de acceso dura 15 minutos
// y el de renovación se rota en cada uso, así que un token robado sirve por poco tiempo.
function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION));
    return s?.tokenAcceso && s?.tokenRenovacion && s?.usuario ? s : null;
  } catch {
    return null;
  }
}

export function SesionProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [modalAbierto, setModalAbierto] = useState(false);
  const sesionRef = useRef(sesion);
  const renovando = useRef(null);

  const guardar = useCallback((nueva) => {
    sesionRef.current = nueva;
    setSesion(nueva);
    if (nueva) localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
    else localStorage.removeItem(CLAVE_SESION);
  }, []);

  /** Pide tokens nuevos una sola vez, aunque varias peticiones fallen al mismo tiempo. */
  const renovar = useCallback(() => {
    if (!renovando.current) {
      const tokenRenovacion = sesionRef.current.tokenRenovacion;
      renovando.current = llamarApi("usuarios", "/auth/renovar", { metodo: "POST", cuerpo: { tokenRenovacion } })
        .then((r) => {
          guardar({ tokenAcceso: r.tokenAcceso, tokenRenovacion: r.tokenRenovacion, usuario: r.usuario });
          return r.tokenAcceso;
        })
        .catch((error) => {
          if (error.estado !== 0) guardar(null);
          throw error;
        })
        .finally(() => {
          renovando.current = null;
        });
    }
    return renovando.current;
  }, [guardar]);

  /** Igual que llamarApi, pero con el token del usuario; si venció, lo renueva y reintenta una vez. */
  const api = useCallback(async (servicio, ruta, opciones = {}) => {
    try {
      return await llamarApi(servicio, ruta, { ...opciones, token: sesionRef.current?.tokenAcceso });
    } catch (error) {
      if (!(error instanceof ErrorApi) || error.estado !== 401 || !sesionRef.current) throw error;
      const nuevoToken = await renovar();
      return llamarApi(servicio, ruta, { ...opciones, token: nuevoToken });
    }
  }, [renovar]);

  // Al recargar la página se confirma con el servidor que la sesión guardada sigue vigente
  // y se refrescan los datos del usuario (por ejemplo, si el administrador le cambió el rol).
  useEffect(() => {
    if (!sesionRef.current) return;
    api("usuarios", "/auth/perfil")
      .then((usuario) => sesionRef.current && guardar({ ...sesionRef.current, usuario }))
      // Si el servidor no responde (estado 0) se mantiene la sesión; solo se cierra si rechaza el token.
      .catch((error) => error.estado !== 0 && guardar(null));
  }, [api, guardar]);

  async function autenticar(ruta, cuerpo) {
    try {
      const r = await llamarApi("usuarios", ruta, { metodo: "POST", cuerpo });
      guardar({ tokenAcceso: r.tokenAcceso, tokenRenovacion: r.tokenRenovacion, usuario: r.usuario });
      setModalAbierto(false);
      return null;
    } catch (error) {
      return error.message;
    }
  }

  // Ambas devuelven un mensaje de error, o null si todo salió bien.
  async function iniciarSesion(correo, clave) {
    const c = correo.trim().toLowerCase();
    if (!REGEX_CORREO.test(c)) return "Ingresa un correo electrónico válido.";
    if (!clave) return "Ingresa tu contraseña.";
    return autenticar("/auth/login", { correo: c, clave });
  }

  async function registrarUsuario(nombre, correo, clave, confirmar) {
    const c = correo.trim().toLowerCase();
    if (nombre.trim().length < 2) return "Ingresa tu nombre.";
    if (!REGEX_CORREO.test(c)) return "Ingresa un correo electrónico válido.";
    if (clave.length < 6) return "La contraseña debe tener al menos 6 caracteres.";
    if (clave !== confirmar) return "Las contraseñas no coinciden.";
    return autenticar("/auth/registro", { nombre: nombre.trim(), correo: c, clave });
  }

  function cerrarSesion() {
    const tokenRenovacion = sesionRef.current?.tokenRenovacion;
    guardar(null);
    // Revoca el token de renovación en el servidor; si falla, igual expira solo.
    if (tokenRenovacion) {
      llamarApi("usuarios", "/auth/cerrar-sesion", { metodo: "POST", cuerpo: { tokenRenovacion } }).catch(() => {});
    }
  }

  const usuario = sesion?.usuario ?? null;
  const rol = usuario?.rol ?? null;

  return (
    <SesionContext.Provider
      value={{
        usuario,
        rol,
        esAdmin: rol === "ADMIN",
        esVendedor: rol === "VENDEDOR",
        esPersonal: rol === "ADMIN" || rol === "VENDEDOR",
        api,
        iniciarSesion,
        registrarUsuario,
        cerrarSesion,
        modalAbierto,
        setModalAbierto,
      }}
    >
      {children}
    </SesionContext.Provider>
  );
}

export function useSesion() {
  return useContext(SesionContext);
}
