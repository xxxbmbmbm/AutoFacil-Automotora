import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import { formatearKilometraje } from "../api/cliente.js";
import { useSesion } from "../contexto/SesionContext.jsx";
import { formatearPrecioClp } from "../datos/vehiculos.js";

// Ficha completa de un vehículo (GET /vehiculos/{id}). La ven todos, incluido el vendedor.
export default function DetalleVehiculo() {
  const { id } = useParams();
  const { api, esVendedor } = useSesion();
  const [vehiculo, setVehiculo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("vehiculos", `/vehiculos/${id}`).then(setVehiculo).catch((e) => setError(e.message));
  }, [api, id]);

  const datos = vehiculo && [
    ["Marca", vehiculo.marca],
    ["Modelo", vehiculo.modelo],
    ["Año", vehiculo.anio],
    ["Tipo", vehiculo.tipo],
    ["Kilometraje", formatearKilometraje(vehiculo.kilometraje)],
    ["Transmisión", vehiculo.transmision],
    ["Estado", vehiculo.estado === "VENDIDO" ? "Vendido" : "Disponible"],
  ];

  return (
    <>
      <EncabezadoPagina
        etiqueta="Ficha del vehículo"
        titulo={vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}` : "Detalle del vehículo"}
        subtitulo="Toda la información del vehículo en un solo lugar"
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {!vehiculo && !error && <p>Cargando vehículo…</p>}
          {vehiculo && (
            <div className="row g-4">
              <div className="col-lg-6">
                <div className="esqueleto marco-resumen" style={{ backgroundColor: vehiculo.colorFondo }}>
                  <img src={vehiculo.imagen} alt={`Foto de ${vehiculo.marca} ${vehiculo.modelo}`} className="foto-resumen-compra" />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="panel-filtros">
                  <p className="precio-vehiculo mb-3">
                    {vehiculo.precioAnterior != null && (
                      <span className="precio-anterior">{formatearPrecioClp(vehiculo.precioAnterior)}</span>
                    )}
                    {formatearPrecioClp(vehiculo.precio)}
                  </p>
                  <table className="tabla-admin mb-3">
                    <tbody>
                      {datos.map(([nombre, valor]) => (
                        <tr key={nombre}><th scope="row">{nombre}</th><td>{valor}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="d-flex gap-2 flex-wrap">
                    {!esVendedor && vehiculo.estado === "DISPONIBLE" && (
                      <Link to={`/comprar?id=${vehiculo.id}`} className="boton-principal">Comprar</Link>
                    )}
                    <Link to="/vehiculos" className="boton-secundario">Volver al catálogo</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
