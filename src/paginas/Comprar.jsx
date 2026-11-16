import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import AvisoSesionRequerida from "../componentes/AvisoSesionRequerida.jsx";
import { useSesion } from "../contexto/SesionContext.jsx";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { formatearPrecioClp } from "../datos/vehiculos.js";

export default function Comprar() {
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const { vehiculos, cargando, recargar } = useVehiculos();
  const { usuario, api } = useSesion();
  const [validado, setValidado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const vehiculo = vehiculos.find((v) => v.id === Number(params.get("id")));

  // Los datos de la tarjeta solo se validan aquí: nunca se envían al servidor (pago de demostración).
  async function enviar(e) {
    e.preventDefault();
    setValidado(true);
    const campos = e.currentTarget.elements;
    if (!e.currentTarget.checkValidity()) return;
    setEnviando(true);
    try {
      const boleta = await api("ventas", "/boletas", {
        metodo: "POST",
        cuerpo: {
          vehiculoIds: [vehiculo.id],
          direccion: campos["compra-direccion"].value.trim(),
          comuna: campos["compra-comuna"].value.trim(),
          ciudad: campos["compra-ciudad"].value.trim(),
        },
      });
      alert(`Compra exitosa (boleta N° ${boleta.id}). Gracias por comprar tu ${vehiculo.marca} ${vehiculo.modelo}.`);
      await recargar(); // el vehículo vendido deja de aparecer en la tienda
      navegar("/vehiculos");
    } catch (problema) {
      setError(problema.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Compra"
        titulo="Confirma tu compra"
        subtitulo="Formulario de demostración: no se procesa ningún pago real ni se guarda información de tarjetas"
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="panel-filtros">
                {vehiculo ? (
                  <>
                    <h5 className="mb-3">Estás comprando</h5>
                    <div className="esqueleto marco-resumen mb-3">
                      <img
                        src={vehiculo.imagen}
                        alt={`Foto de ${vehiculo.marca} ${vehiculo.modelo}`}
                        className="foto-resumen-compra"
                      />
                    </div>
                    <p className="marca-modelo mb-1">{vehiculo.marca} {vehiculo.modelo} {vehiculo.anio}</p>
                    <p className="detalle-vehiculo mb-0">{vehiculo.kilometraje} &middot; {vehiculo.transmision}</p>
                    <div className="corte-ficha" />
                    <p className="precio-vehiculo mb-0">{formatearPrecioClp(vehiculo.precio)}</p>
                  </>
                ) : cargando ? (
                  <p className="mb-0">Cargando vehículo…</p>
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
                {usuario ? (
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
                    {error && <div className="alert alert-danger py-2 mt-3 mb-0" role="alert">{error}</div>}
                    <button type="submit" className="boton-principal w-100 mt-4" disabled={enviando}>Confirmar pago</button>
                  </div>
                </form>
                ) : (
                  <div className="panel-filtros"><AvisoSesionRequerida accion="comprar este vehículo" /></div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
