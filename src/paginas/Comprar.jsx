import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { formatearPrecioClp } from "../datos/vehiculos.js";

export default function Comprar() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { vehiculos } = useVehiculos();
  const [validado, setValidado] = useState(false);
  const vehiculo = vehiculos.find((v) => v.id === Number(params.get("id")));

  function enviar(e) {
    e.preventDefault();
    setValidado(true);
    if (!e.currentTarget.checkValidity()) return;
    alert("¡Compra exitosa! Gracias por comprar tu " + vehiculo.marca + " " + vehiculo.modelo + ".");
    navegar("/vehiculos");
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Compra"
        titulo="Confirma tu compra"
        subtitulo="Formulario de demostración: no se procesa ningún pago real ni se guarda información de tarjetas."
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="panel-filtros">
                {vehiculo ? (
                  <>
                    <h5 className="mb-3">Estás comprando</h5>
                    <img
                      src={vehiculo.imagen}
                      alt={`Foto de ${vehiculo.marca} ${vehiculo.modelo}`}
                      className="foto-resumen-compra mb-3"
                    />
                    <p className="marca-modelo mb-1">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</p>
                    <p className="detalle-vehiculo mb-2">{vehiculo.kilometraje} &middot; {vehiculo.transmision}</p>
                    <p className="precio-vehiculo mb-0">{formatearPrecioClp(vehiculo.precio)}</p>
                  </>
                ) : (
                  <>
                    <p className="mb-3">No encontramos el vehículo seleccionado.</p>
                    <Link to="/vehiculos" className="boton-secundario">Volver al catálogo</Link>
                  </>
                )}
              </div>
            </div>

            {vehiculo && (
              <div className="col-lg-7">
                <form className={validado ? "was-validated" : ""} onSubmit={enviar} noValidate>
                  <div className="panel-filtros mb-4">
                    <h5 className="mb-3">Dirección de entrega</h5>
                    <div className="mb-3">
                      <label htmlFor="compra-direccion" className="form-label">Calle y número</label>
                      <input
                        type="text" className="form-control" id="compra-direccion"
                        placeholder="Ej: Av. Providencia 1234, depto 56" autoComplete="street-address" required
                      />
                      <div className="invalid-feedback">Ingresa tu calle y número.</div>
                    </div>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <label htmlFor="compra-comuna" className="form-label">Comuna</label>
                        <input type="text" className="form-control" id="compra-comuna" required />
                        <div className="invalid-feedback">Ingresa tu comuna.</div>
                      </div>
                      <div className="col-sm-6">
                        <label htmlFor="compra-ciudad" className="form-label">Ciudad</label>
                        <input type="text" className="form-control" id="compra-ciudad" required />
                        <div className="invalid-feedback">Ingresa tu ciudad.</div>
                      </div>
                    </div>
                  </div>

                  <div className="panel-filtros">
                    <h5 className="mb-3">Datos de la tarjeta</h5>
                    <div className="mb-3">
                      <label htmlFor="compra-nombre-tarjeta" className="form-label">Nombre en la tarjeta</label>
                      <input type="text" className="form-control" id="compra-nombre-tarjeta" required />
                      <div className="invalid-feedback">Ingresa el nombre tal como aparece en la tarjeta.</div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="compra-numero-tarjeta" className="form-label">Número de tarjeta</label>
                      <input
                        type="text" className="form-control" id="compra-numero-tarjeta"
                        placeholder="0000 0000 0000 0000" maxLength={19} pattern="[0-9 ]{13,19}" required
                      />
                      <div className="invalid-feedback">Ingresa un número de tarjeta válido (entre 13 y 19 dígitos).</div>
                    </div>
                    <div className="row g-3">
                      <div className="col-6">
                        <label htmlFor="compra-vencimiento" className="form-label">Vencimiento (MM/AA)</label>
                        <input
                          type="text" className="form-control" id="compra-vencimiento"
                          placeholder="MM/AA" maxLength={5} pattern="(0[1-9]|1[0-2])\/[0-9]{2}" required
                        />
                        <div className="invalid-feedback">Usa el formato MM/AA.</div>
                      </div>
                      <div className="col-6">
                        <label htmlFor="compra-cvv" className="form-label">CVV</label>
                        <input
                          type="text" className="form-control" id="compra-cvv"
                          placeholder="123" maxLength={4} pattern="[0-9]{3,4}" required
                        />
                        <div className="invalid-feedback">Ingresa el código de seguridad.</div>
                      </div>
                    </div>
                    <button type="submit" className="boton-principal w-100 mt-4">Confirmar pago</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
