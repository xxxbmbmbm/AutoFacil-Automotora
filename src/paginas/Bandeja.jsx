import { useCallback, useEffect, useState } from "react";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import Icono from "../componentes/Icono.jsx";
import { EVENTO_BANDEJA } from "../componentes/Navbar.jsx";
import { formatearFecha } from "../api/cliente.js";
import { useSesion } from "../contexto/SesionContext.jsx";

const ESTADOS = { NUEVA: "Nueva", EN_PROCESO: "En proceso", RESPONDIDA: "Respondida", CERRADA: "Cerrada" };
const CANALES = { WHATSAPP: "WhatsApp", CORREO: "Correo", LLAMADA: "Llamada" };

// Bandeja de notificaciones del administrador: solicitudes del formulario de contacto,
// con accesos directos para responder por WhatsApp, correo o teléfono.
export default function Bandeja() {
  const { api } = useSesion();
  const [solicitudes, setSolicitudes] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [seleccionada, setSeleccionada] = useState(null);
  const [gestion, setGestion] = useState({ estado: "", canalRespuesta: "", notasInternas: "" });
  const [aviso, setAviso] = useState("");
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    api("contacto", "/contactos" + (filtro ? `?estado=${filtro}` : ""))
      .then((lista) => {
        setSolicitudes(lista);
        window.dispatchEvent(new Event(EVENTO_BANDEJA)); // actualiza el contador de la campana
      })
      .catch((e) => setError(e.message));
  }, [api, filtro]);

  useEffect(cargar, [cargar]);

  function mostrar(s) {
    setSeleccionada(s);
    setGestion({ estado: s.estado, canalRespuesta: s.canalRespuesta ?? "", notasInternas: s.notasInternas ?? "" });
    setAviso("");
    setError("");
  }

  async function guardar(cambios) {
    try {
      const actualizada = await api("contacto", `/contactos/${seleccionada.id}`, { metodo: "PATCH", cuerpo: cambios });
      mostrar(actualizada);
      setAviso("Cambios guardados.");
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  // Abrir una solicitud nueva la marca como "en proceso" (deja de contar como notificación).
  async function abrir(s) {
    mostrar(s);
    if (s.estado === "NUEVA") {
      try {
        mostrar(await api("contacto", `/contactos/${s.id}`, { metodo: "PATCH", cuerpo: { estado: "EN_PROCESO" } }));
        cargar();
      } catch (e) {
        setError(e.message);
      }
    }
  }

  function enviarGestion(e) {
    e.preventDefault();
    guardar({ ...gestion, canalRespuesta: gestion.canalRespuesta || null });
  }

  async function eliminar() {
    if (!window.confirm(`¿Eliminar la solicitud de ${seleccionada.nombre}?`)) return;
    try {
      await api("contacto", `/contactos/${seleccionada.id}`, { metodo: "DELETE" });
      setSeleccionada(null);
      cargar();
    } catch (e) {
      setError(e.message);
    }
  }

  const cambiar = (campo) => (e) => setGestion({ ...gestion, [campo]: e.target.value });

  return (
    <>
      <EncabezadoPagina
        etiqueta="Administración"
        titulo="Bandeja de contacto"
        subtitulo="Mensajes enviados desde el formulario de contacto, listos para responder de forma personalizada"
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          <div className="filtros-estado" role="group" aria-label="Filtrar por estado">
            {[["", "Todas"], ...Object.entries(ESTADOS)].map(([valor, texto]) => (
              <button key={valor} type="button" className={filtro === valor ? "activo" : ""} onClick={() => setFiltro(valor)}>
                {texto}
              </button>
            ))}
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <div className="row g-4">
            <div className="col-lg-5">
              {solicitudes === null && !error && <p>Cargando solicitudes…</p>}
              {solicitudes?.length === 0 && <p className="text-muted">No hay solicitudes en esta vista.</p>}
              {solicitudes?.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={"item-bandeja" + (s.estado === "NUEVA" ? " no-leido" : "") + (seleccionada?.id === s.id ? " seleccionado" : "")}
                  onClick={() => abrir(s)}
                >
                  <span className="d-flex justify-content-between gap-2">
                    <span className="nombre-remitente">{s.nombre}</span>
                    <span className="estado-chip">{ESTADOS[s.estado]}</span>
                  </span>
                  <span className="d-block small">{s.asunto}</span>
                  <span className="d-block small text-muted">{formatearFecha(s.fechaCreacion)}</span>
                </button>
              ))}
            </div>

            <div className="col-lg-7">
              {!seleccionada ? (
                <div className="panel-filtros text-muted">Selecciona una solicitud para ver el detalle.</div>
              ) : (
                <div className="panel-filtros">
                  <h5 className="mb-1">{seleccionada.nombre}</h5>
                  <p className="text-muted small mb-3">
                    {seleccionada.asunto} · {formatearFecha(seleccionada.fechaCreacion)}
                  </p>
                  <p className="mb-1"><strong>Correo:</strong> {seleccionada.correo}</p>
                  <p className="mb-3"><strong>Teléfono:</strong> {seleccionada.telefono || "No indicó"}</p>
                  <p className="mensaje-cliente mb-3">{seleccionada.mensaje}</p>

                  <div className="acciones-contacto mb-4">
                    {seleccionada.enlaces.whatsapp && (
                      <a className="boton-principal" href={seleccionada.enlaces.whatsapp} target="_blank" rel="noreferrer">
                        <Icono nombre="mensaje" tamano={16} />WhatsApp
                      </a>
                    )}
                    <a className="boton-secundario" href={seleccionada.enlaces.correo}>
                      <Icono nombre="correo" tamano={16} />Correo
                    </a>
                    {seleccionada.enlaces.llamada && (
                      <a className="boton-secundario" href={seleccionada.enlaces.llamada}>
                        <Icono nombre="telefono" tamano={16} />Llamar
                      </a>
                    )}
                  </div>

                  <form onSubmit={enviarGestion}>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label htmlFor="gestion-estado" className="form-label">Estado</label>
                        <select id="gestion-estado" className="form-select" value={gestion.estado} onChange={cambiar("estado")}>
                          {Object.entries(ESTADOS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                        </select>
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="gestion-canal" className="form-label">Respondido por</label>
                        <select id="gestion-canal" className="form-select" value={gestion.canalRespuesta} onChange={cambiar("canalRespuesta")}>
                          <option value="">Sin responder</option>
                          {Object.entries(CANALES).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label htmlFor="gestion-notas" className="form-label">Notas internas (el cliente no las ve)</label>
                        <textarea id="gestion-notas" className="form-control" rows="3" value={gestion.notasInternas} onChange={cambiar("notasInternas")} />
                      </div>
                      {aviso && <div className="col-12"><div className="alert alert-success py-2 mb-0" role="status">{aviso}</div></div>}
                      <div className="col-12 d-flex gap-2 flex-wrap">
                        <button type="submit" className="boton-principal">Guardar</button>
                        <button type="button" className="boton-eliminar-vehiculo" onClick={eliminar}>
                          <Icono nombre="basurero" tamano={16} />Eliminar
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
