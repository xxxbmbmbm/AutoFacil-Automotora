import { useState } from "react";
import { useSesion } from "../contexto/SesionContext.jsx";

const vacio = { nombre: "", correo: "", clave: "", confirmar: "" };

export default function ModalSesion() {
  const { modalAbierto, setModalAbierto, iniciarSesion, registrarUsuario } = useSesion();
  const [modo, setModo] = useState("entrar");
  const [campos, setCampos] = useState(vacio);
  const [error, setError] = useState("");

  if (!modalAbierto) return null;

  const cambiar = (campo) => (e) => setCampos({ ...campos, [campo]: e.target.value });

  function cerrar() {
    setModalAbierto(false);
    setCampos(vacio);
    setError("");
  }

  function elegirModo(nuevo) {
    setModo(nuevo);
    setError("");
  }

  function enviar(e) {
    e.preventDefault();
    const resultado =
      modo === "entrar"
        ? iniciarSesion(campos.correo, campos.clave)
        : registrarUsuario(campos.nombre, campos.correo, campos.clave, campos.confirmar);
    if (resultado) {
      setError(resultado);
      return;
    }
    setCampos(vacio);
    setError("");
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" onClick={cerrar}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{modo === "entrar" ? "Iniciar sesión" : "Crear cuenta"}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={cerrar}></button>
            </div>
            <div className="modal-body">
              <div className="pestanas-sesion mb-3">
                <button type="button" className={modo === "entrar" ? "activa" : ""} onClick={() => elegirModo("entrar")}>
                  Ingresar
                </button>
                <button type="button" className={modo === "registro" ? "activa" : ""} onClick={() => elegirModo("registro")}>
                  Registrarse
                </button>
              </div>

              <form onSubmit={enviar} noValidate>
                {modo === "registro" && (
                  <div className="mb-3">
                    <label htmlFor="sesion-nombre" className="form-label">Nombre</label>
                    <input id="sesion-nombre" className="form-control" value={campos.nombre} onChange={cambiar("nombre")} autoComplete="name" />
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="sesion-correo" className="form-label">Correo electrónico</label>
                  <input id="sesion-correo" type="email" className="form-control" value={campos.correo} onChange={cambiar("correo")} autoComplete="email" />
                </div>
                <div className="mb-3">
                  <label htmlFor="sesion-clave" className="form-label">Contraseña</label>
                  <input
                    id="sesion-clave" type="password" className="form-control" value={campos.clave} onChange={cambiar("clave")}
                    autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                  />
                </div>
                {modo === "registro" && (
                  <div className="mb-3">
                    <label htmlFor="sesion-confirmar" className="form-label">Repetir contraseña</label>
                    <input id="sesion-confirmar" type="password" className="form-control" value={campos.confirmar} onChange={cambiar("confirmar")} autoComplete="new-password" />
                  </div>
                )}

                {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

                <button type="submit" className="boton-principal w-100">
                  {modo === "entrar" ? "Ingresar" : "Crear cuenta"}
                </button>
                <p className="text-muted small mt-3 mb-0">
                  Demostración: los datos se guardan solo en este navegador.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show"></div>
    </>
  );
}
