import { useCallback, useEffect, useState } from "react";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import Icono from "../componentes/Icono.jsx";
import { useSesion } from "../contexto/SesionContext.jsx";

const ROLES = { ADMIN: "Administrador", VENDEDOR: "Vendedor", CLIENTE: "Cliente" };
const vacio = { nombre: "", correo: "", clave: "", rol: "VENDEDOR" };

// Administración de cuentas (solo ADMIN): crear vendedores u otros administradores,
// activar o desactivar cuentas y eliminarlas.
export default function Usuarios() {
  const { api, usuario: yo } = useSesion();
  const [usuarios, setUsuarios] = useState(null);
  const [nuevo, setNuevo] = useState(vacio);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    api("usuarios", "/usuarios").then(setUsuarios).catch((e) => setError(e.message));
  }, [api]);

  useEffect(cargar, [cargar]);

  async function ejecutar(accion) {
    try {
      await accion();
      setError("");
      cargar();
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    }
  }

  async function crear(e) {
    e.preventDefault();
    const creado = await ejecutar(() => api("usuarios", "/usuarios", { metodo: "POST", cuerpo: nuevo }));
    if (creado) setNuevo(vacio);
  }

  const alternarActivo = (u) =>
    ejecutar(() => api("usuarios", `/usuarios/${u.id}`, {
      metodo: "PUT",
      cuerpo: { nombre: u.nombre, correo: u.correo, telefono: u.telefono ?? "", rol: u.rol, activo: !u.activo },
    }));

  function eliminar(u) {
    if (window.confirm(`¿Eliminar la cuenta de ${u.nombre}?`)) ejecutar(() => api("usuarios", `/usuarios/${u.id}`, { metodo: "DELETE" }));
  }

  const cambiar = (campo) => (e) => setNuevo({ ...nuevo, [campo]: e.target.value });

  return (
    <>
      <EncabezadoPagina etiqueta="Administración" titulo="Usuarios" subtitulo="Cuentas de clientes, vendedores y administradores" />
      <section className="franja-seccion pt-4">
        <div className="container">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="panel-filtros mb-4">
            <h5 className="mb-3">Crear cuenta</h5>
            <form onSubmit={crear}>
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label htmlFor="u-nombre" className="form-label">Nombre</label>
                  <input id="u-nombre" className="form-control" value={nuevo.nombre} onChange={cambiar("nombre")} required minLength={2} />
                </div>
                <div className="col-md-3">
                  <label htmlFor="u-correo" className="form-label">Correo</label>
                  <input id="u-correo" type="email" className="form-control" value={nuevo.correo} onChange={cambiar("correo")} required />
                </div>
                <div className="col-md-2">
                  <label htmlFor="u-clave" className="form-label">Contraseña</label>
                  <input id="u-clave" type="password" className="form-control" value={nuevo.clave} onChange={cambiar("clave")} required minLength={6} autoComplete="new-password" />
                </div>
                <div className="col-md-2">
                  <label htmlFor="u-rol" className="form-label">Rol</label>
                  <select id="u-rol" className="form-select" value={nuevo.rol} onChange={cambiar("rol")}>
                    {Object.entries(ROLES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <button type="submit" className="boton-principal w-100"><Icono nombre="mas" tamano={16} />Crear</button>
                </div>
              </div>
            </form>
          </div>

          {usuarios === null && !error && <p>Cargando usuarios…</p>}
          {usuarios && (
            <div className="panel-filtros tabla-desplazable">
              <table className="tabla-admin">
                <thead>
                  <tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => (
                    <tr key={u.id}>
                      <td>{u.nombre}</td>
                      <td>{u.correo}</td>
                      <td><span className="estado-chip">{ROLES[u.rol]}</span></td>
                      <td>{u.activo ? "Activa" : "Desactivada"}</td>
                      <td className="text-nowrap">
                        {u.id !== yo.id && (
                          <div className="d-flex gap-3">
                            <button type="button" className="btn btn-link p-0 texto-rosa" onClick={() => alternarActivo(u)}>
                              {u.activo ? "Desactivar" : "Activar"}
                            </button>
                            <button type="button" className="btn btn-link p-0 texto-rosa" onClick={() => eliminar(u)}>Eliminar</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
