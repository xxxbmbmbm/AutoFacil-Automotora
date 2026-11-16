// Backend simulado en memoria para las pruebas: responde las mismas rutas que los 4 microservicios,
// con las mismas reglas de roles, para probar el frontend sin levantar Docker.
import { listaDeVehiculos } from "../datos/vehiculos.js";

export const CUENTAS = {
  admin: { id: 1, nombre: "Administrador", correo: "admin@autofacil.cl", clave: "Prueba-Admin-1", rol: "ADMIN", activo: true },
  vendedor: { id: 2, nombre: "Vendedor AutoFacil", correo: "vendedor@autofacil.cl", clave: "Prueba-Vendedor-1", rol: "VENDEDOR", activo: true },
  cliente: { id: 3, nombre: "Cliente Prueba", correo: "cliente@correo.cl", clave: "Clave123", rol: "CLIENTE", activo: true },
};

const CATEGORIAS = ["Hatchback", "Sedán", "SUV", "Pickup"].map((nombre, i) => ({ id: i + 1, nombre }));

let datos;

export function reiniciarApiFalsa() {
  datos = {
    usuarios: Object.values(CUENTAS).map((u) => ({ ...u })),
    vehiculos: listaDeVehiculos.map((v) => ({
      ...v,
      kilometraje: Number(v.kilometraje.replace(/\D/g, "")),
      estado: "DISPONIBLE",
      categoriaId: CATEGORIAS.find((c) => c.nombre === v.tipo).id,
    })),
    boletas: [],
    contactos: [],
    siguienteId: 100,
    caido: false,
  };
}

/** Simula que el servidor no responde (para probar los mensajes de error de conexión). */
export function apagarApiFalsa() {
  datos.caido = true;
}

export const datosApiFalsa = () => datos;

const publico = (u) => ({ id: u.id, nombre: u.nombre, correo: u.correo, telefono: u.telefono ?? null, rol: u.rol, activo: u.activo });
const tokens = (u) => ({ tokenAcceso: `token-${u.id}`, tokenRenovacion: `renovar-${u.id}`, tipoToken: "Bearer", usuario: publico(u) });

function responder(estado, cuerpo) {
  return Promise.resolve(new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  }));
}

const error = (estado, mensaje) => responder(estado, { estado, mensaje, errores: {} });

export function fetchFalso(url, opciones = {}) {
  if (datos.caido) return Promise.reject(new TypeError("Failed to fetch"));
  const { pathname, searchParams } = new URL(url);
  const ruta = pathname.replace("/api/v1", "");
  const metodo = opciones.method || "GET";
  const cuerpo = opciones.body ? JSON.parse(opciones.body) : {};
  const id = Number(ruta.split("/")[2]);
  const token = opciones.headers?.Authorization?.replace("Bearer ", "");
  const yo = datos.usuarios.find((u) => token === `token-${u.id}` && u.activo);
  const exigir = (...roles) => (!yo ? error(401) : roles.length && !roles.includes(yo.rol) ? error(403) : null);
  const accion = `${metodo} ${ruta.replace(/\/\d+/, "/:id")}`;

  switch (accion) {
    // ms-usuarios
    case "POST /auth/login": {
      const u = datos.usuarios.find((x) => x.correo === cuerpo.correo && x.clave === cuerpo.clave && x.activo);
      return u ? responder(200, tokens(u)) : error(401, "Correo o contraseña incorrectos.");
    }
    case "POST /auth/registro": {
      if (datos.usuarios.some((u) => u.correo === cuerpo.correo)) return error(409, "Ya existe una cuenta con ese correo.");
      const u = { ...cuerpo, id: datos.siguienteId++, rol: "CLIENTE", activo: true };
      datos.usuarios.push(u);
      return responder(201, tokens(u));
    }
    case "POST /auth/renovar": {
      const u = datos.usuarios.find((x) => cuerpo.tokenRenovacion === `renovar-${x.id}`);
      return u ? responder(200, tokens(u)) : error(401, "La sesión expiró. Inicia sesión nuevamente.");
    }
    case "POST /auth/cerrar-sesion":
      return responder(204);
    case "GET /auth/perfil":
      return exigir() || responder(200, publico(yo));
    case "GET /usuarios":
      return exigir("ADMIN") || responder(200, datos.usuarios.map(publico));
    case "POST /usuarios": {
      const u = { ...cuerpo, id: datos.siguienteId++, activo: true };
      return exigir("ADMIN") || (datos.usuarios.push(u), responder(201, publico(u)));
    }
    case "PUT /usuarios/:id":
      return exigir("ADMIN") || (Object.assign(datos.usuarios.find((u) => u.id === id), cuerpo), responder(200, {}));
    case "DELETE /usuarios/:id":
      return exigir("ADMIN") || ((datos.usuarios = datos.usuarios.filter((u) => u.id !== id)), responder(204));

    // ms-vehiculos
    case "GET /vehiculos": {
      const estado = searchParams.get("estado");
      return responder(200, datos.vehiculos.filter((v) => !estado || v.estado === estado));
    }
    case "GET /vehiculos/:id": {
      const v = datos.vehiculos.find((x) => x.id === id);
      return v ? responder(200, v) : error(404, `No existe el vehículo con id ${id}.`);
    }
    case "POST /vehiculos": {
      const v = { ...cuerpo, id: datos.siguienteId++, estado: "DISPONIBLE", tipo: CATEGORIAS.find((c) => c.id === cuerpo.categoriaId).nombre };
      return exigir("ADMIN") || (datos.vehiculos.unshift(v), responder(201, v));
    }
    case "DELETE /vehiculos/:id":
      return exigir("ADMIN") || ((datos.vehiculos = datos.vehiculos.filter((v) => v.id !== id)), responder(204));
    case "GET /categorias":
      return responder(200, CATEGORIAS);

    // ms-ventas
    case "POST /boletas": {
      const negado = exigir("CLIENTE", "ADMIN");
      if (negado) return negado;
      const vehiculos = cuerpo.vehiculoIds.map((vid) => datos.vehiculos.find((v) => v.id === vid));
      if (vehiculos.some((v) => v.estado !== "DISPONIBLE")) return error(409, "El vehículo ya no está disponible.");
      vehiculos.forEach((v) => (v.estado = "VENDIDO"));
      const b = {
        id: datos.siguienteId++, usuarioId: yo.id, nombreCliente: yo.nombre, correoCliente: yo.correo,
        direccion: cuerpo.direccion, comuna: cuerpo.comuna, ciudad: cuerpo.ciudad, estado: "PAGADA",
        fecha: "2026-11-16T12:00:00", total: vehiculos.reduce((s, v) => s + v.precio, 0),
        detalles: vehiculos.map((v) => ({ id: v.id, vehiculoId: v.id, descripcion: `${v.marca} ${v.modelo} ${v.anio}`, subtotal: v.precio })),
      };
      datos.boletas.unshift(b);
      return responder(201, b);
    }
    case "GET /boletas":
      return exigir("ADMIN", "VENDEDOR") || responder(200, datos.boletas);
    case "GET /boletas/mias":
      return exigir() || responder(200, datos.boletas.filter((b) => b.usuarioId === yo.id));
    case "PATCH /boletas/:id/estado": {
      const negado = exigir("ADMIN");
      if (negado) return negado;
      const b = datos.boletas.find((x) => x.id === id);
      if (cuerpo.estado === "ANULADA") b.detalles.forEach((d) => (datos.vehiculos.find((v) => v.id === d.vehiculoId).estado = "DISPONIBLE"));
      b.estado = cuerpo.estado;
      return responder(200, b);
    }
    case "DELETE /boletas/:id":
      return exigir("ADMIN") || ((datos.boletas = datos.boletas.filter((b) => b.id !== id)), responder(204));

    // ms-contacto
    case "POST /contactos": {
      const c = {
        ...cuerpo, id: datos.siguienteId++, usuarioId: yo?.id, estado: "NUEVA", canalRespuesta: null, notasInternas: null,
        fechaCreacion: "2026-11-16T12:00:00",
        enlaces: { whatsapp: cuerpo.telefono ? "https://wa.me/56912345678" : null, correo: `mailto:${cuerpo.correo}`, llamada: cuerpo.telefono ? "tel:+56912345678" : null },
      };
      return exigir() || (datos.contactos.unshift(c), responder(201, c));
    }
    case "GET /contactos": {
      const estado = searchParams.get("estado");
      return exigir("ADMIN") || responder(200, datos.contactos.filter((c) => !estado || c.estado === estado));
    }
    case "GET /contactos/resumen":
      return exigir("ADMIN") || responder(200, { nuevas: datos.contactos.filter((c) => c.estado === "NUEVA").length });
    case "PATCH /contactos/:id": {
      if (cuerpo.estado === "RESPONDIDA" && !cuerpo.canalRespuesta) {
        return error(409, "Indica por qué medio respondiste: WhatsApp, correo o llamada.");
      }
      const c = datos.contactos.find((x) => x.id === id);
      return exigir("ADMIN") || (Object.assign(c, cuerpo), responder(200, { ...c }));
    }
    case "DELETE /contactos/:id":
      return exigir("ADMIN") || ((datos.contactos = datos.contactos.filter((c) => c.id !== id)), responder(204));
    default:
      return error(404, `Ruta no simulada: ${accion}`);
  }
}
