import { Fragment, useCallback, useEffect, useState } from "react";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import { formatearFecha } from "../api/cliente.js";
import { useSesion } from "../contexto/SesionContext.jsx";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { formatearPrecioClp } from "../datos/vehiculos.js";

const ESTADOS = { PAGADA: "Pagada", ENTREGADA: "Entregada", ANULADA: "Anulada" };

// "propias": boletas del usuario (Mis compras). Sin ella: todas las órdenes (ADMIN y VENDEDOR).
// Solo el administrador ve los botones para cambiar el estado o eliminar.
export default function Ordenes({ propias = false }) {
  const { api, esAdmin } = useSesion();
  const { recargar: recargarCatalogo } = useVehiculos();
  const [boletas, setBoletas] = useState(null);
  const [abierta, setAbierta] = useState(null);
  const [error, setError] = useState("");

  const cargar = useCallback(() => {
    api("ventas", propias ? "/boletas/mias" : "/boletas")
      .then(setBoletas)
      .catch((e) => setError(e.message));
  }, [api, propias]);

  useEffect(cargar, [cargar]);

  async function ejecutar(accion) {
    try {
      await accion();
      setError("");
      cargar();
      recargarCatalogo(); // anular una boleta devuelve los vehículos a la tienda
    } catch (e) {
      setError(e.message);
    }
  }

  const cambiarEstado = (id, estado) =>
    ejecutar(() => api("ventas", `/boletas/${id}/estado`, { metodo: "PATCH", cuerpo: { estado } }));

  function anular(id) {
    if (window.confirm(`¿Anular la boleta N° ${id}? Los vehículos volverán a estar disponibles.`)) cambiarEstado(id, "ANULADA");
  }

  function eliminar(id) {
    if (window.confirm(`¿Eliminar la boleta N° ${id}?`)) ejecutar(() => api("ventas", `/boletas/${id}`, { metodo: "DELETE" }));
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta={propias ? "Tu cuenta" : "Ventas"}
        titulo={propias ? "Mis compras" : "Órdenes de compra"}
        subtitulo={propias ? "Revisa el estado de los vehículos que compraste" : "Todas las boletas emitidas por la tienda"}
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {boletas === null && !error && <p>Cargando órdenes…</p>}
          {boletas?.length === 0 && <p className="text-muted">Todavía no hay órdenes.</p>}
          {boletas?.length > 0 && (
            <div className="panel-filtros tabla-desplazable">
              <table className="tabla-admin">
                <thead>
                  <tr>
                    <th>N°</th><th>Fecha</th>{!propias && <th>Cliente</th>}<th>Total</th><th>Estado</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {boletas.map((b) => (
                    <Fragment key={b.id}>
                      <tr className={abierta === b.id ? "fila-activa" : ""}>
                        <td>{b.id}</td>
                        <td>{formatearFecha(b.fecha)}</td>
                        {!propias && <td>{b.nombreCliente}<br /><span className="text-muted small">{b.correoCliente}</span></td>}
                        <td>{formatearPrecioClp(b.total)}</td>
                        <td><span className={"estado-chip" + (b.estado === "PAGADA" ? " estado-destacado" : "")}>{ESTADOS[b.estado]}</span></td>
                        <td>
                          <button type="button" className="btn btn-link p-0 texto-rosa" onClick={() => setAbierta(abierta === b.id ? null : b.id)}>
                            {abierta === b.id ? "Ocultar" : "Ver detalle"}
                          </button>
                        </td>
                      </tr>
                      {abierta === b.id && (
                        <tr>
                          <td colSpan={propias ? 5 : 6}>
                            <p className="mb-2">Entrega en {b.direccion}, {b.comuna}, {b.ciudad}</p>
                            <ul className="mb-2">
                              {b.detalles.map((d) => (
                                <li key={d.id}>{d.descripcion}: {formatearPrecioClp(d.subtotal)}</li>
                              ))}
                            </ul>
                            {esAdmin && !propias && (
                              <div className="d-flex gap-2 flex-wrap">
                                {b.estado === "PAGADA" && (
                                  <button type="button" className="boton-secundario" onClick={() => cambiarEstado(b.id, "ENTREGADA")}>
                                    Marcar como entregada
                                  </button>
                                )}
                                {b.estado !== "ANULADA" && (
                                  <button type="button" className="boton-secundario" onClick={() => anular(b.id)}>Anular boleta</button>
                                )}
                                {b.estado === "ANULADA" && (
                                  <button type="button" className="boton-eliminar-vehiculo" onClick={() => eliminar(b.id)}>Eliminar boleta</button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
