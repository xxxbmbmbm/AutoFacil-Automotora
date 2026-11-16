// Comunicación REST con los 4 microservicios. Las URL vienen de las variables de entorno de Vite
// (.env.development o .env.development.local); los valores por defecto sirven para el backend local.
export const URLS_API = {
  usuarios: import.meta.env.VITE_API_USUARIOS_URL || "http://localhost:8081/api/v1",
  vehiculos: import.meta.env.VITE_API_VEHICULOS_URL || "http://localhost:8082/api/v1",
  ventas: import.meta.env.VITE_API_VENTAS_URL || "http://localhost:8083/api/v1",
  contacto: import.meta.env.VITE_API_CONTACTO_URL || "http://localhost:8084/api/v1",
};

/** Error con el estado HTTP y el mensaje en español que envía el backend. */
export class ErrorApi extends Error {
  constructor(estado, mensaje, errores = {}) {
    super(mensaje);
    this.estado = estado;
    this.errores = errores;
  }
}

/**
 * Llama a un microservicio y devuelve el JSON de la respuesta (o null si no tiene cuerpo).
 * Lanza ErrorApi si el servidor responde con error o no se puede conectar.
 */
export async function llamarApi(servicio, ruta, { metodo = "GET", cuerpo, token } = {}) {
  const encabezados = {};
  if (cuerpo !== undefined) encabezados["Content-Type"] = "application/json";
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(URLS_API[servicio] + ruta, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.");
  }

  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!respuesta.ok) {
    const mensaje = datos?.mensaje || mensajePorEstado(respuesta.status);
    throw new ErrorApi(respuesta.status, mensaje, datos?.errores);
  }
  return datos;
}

function mensajePorEstado(estado) {
  if (estado === 401) return "Tu sesión expiró. Inicia sesión nuevamente.";
  if (estado === 403) return "No tienes permisos para realizar esta acción.";
  return "Ocurrió un error inesperado. Intenta de nuevo.";
}

/** "32000" -> "32.000 km", igual que mostraba el catálogo antes de tener backend. */
export function formatearKilometraje(km) {
  return Number(km).toLocaleString("es-CL") + " km";
}

export function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
}
