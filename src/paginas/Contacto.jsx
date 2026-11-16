import { useState } from "react";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import Icono from "../componentes/Icono.jsx";
import AvisoSesionRequerida from "../componentes/AvisoSesionRequerida.jsx";
import { useSesion } from "../contexto/SesionContext.jsx";

const datos = [
  { icono: "ubicacion", titulo: "Dirección", texto: "Av. Principal 1234, Santiago, Chile" },
  { icono: "telefono", titulo: "Teléfono", texto: "+56 9 1234 5678" },
  { icono: "correo", titulo: "Correo", texto: "contacto@autofacil.cl" },
  { icono: "reloj", titulo: "Horario de atención", texto: "Lunes a sábado, 9:30 a 19:00 hrs" },
];

export default function Contacto() {
  const [validado, setValidado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const { usuario, api } = useSesion();

  async function enviar(e) {
    e.preventDefault();
    const formulario = e.currentTarget;
    setValidado(true);
    if (!formulario.checkValidity()) return;
    const campo = (id) => formulario.elements[id].value.trim();
    const nombre = campo("contacto-nombre");
    setEnviando(true);
    try {
      await api("contacto", "/contactos", {
        metodo: "POST",
        cuerpo: {
          nombre,
          correo: campo("contacto-correo"),
          telefono: campo("contacto-telefono"),
          asunto: campo("contacto-asunto"),
          mensaje: campo("contacto-mensaje"),
        },
      });
      alert(
        "Gracias, " + nombre + ". Recibimos tu mensaje y un asesor de AutoFacil " +
        "se pondrá en contacto contigo a la brevedad."
      );
      formulario.reset();
      setValidado(false);
      setError("");
    } catch (problema) {
      setError(problema.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Hablemos"
        titulo="Contacto"
        subtitulo="¿Tienes dudas sobre algún vehículo? Escríbenos y te respondemos a la brevedad"
      />
      <section className="franja-seccion">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-5">
              {datos.map((d) => (
                <div className="dato-contacto" key={d.titulo}>
                  <Icono nombre={d.icono} />
                  <div>
                    <h6 className="mb-1">{d.titulo}</h6>
                    <p className="text-muted mb-0">{d.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-lg-7">
              <div className="tarjeta-contacto">
                <h4 className="mb-3">Envíanos un mensaje</h4>
                {usuario ? (
                <form className={validado ? "was-validated" : ""} onSubmit={enviar} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="contacto-nombre" className="form-label">Nombre completo</label>
                      <input type="text" className="form-control" id="contacto-nombre" name="contacto-nombre" required />
                      <div className="invalid-feedback">Ingresa tu nombre.</div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="contacto-correo" className="form-label">Correo electrónico</label>
                      <input type="email" className="form-control" id="contacto-correo" required />
                      <div className="invalid-feedback">Ingresa un correo electrónico válido.</div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="contacto-telefono" className="form-label">Teléfono (opcional)</label>
                      <input type="tel" className="form-control" id="contacto-telefono" pattern="[0-9+\s]{7,15}" />
                      <div className="invalid-feedback">Ingresa un teléfono válido.</div>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="contacto-asunto" className="form-label">Asunto</label>
                      <select className="form-select" id="contacto-asunto" defaultValue="" required>
                        <option value="" disabled>Selecciona una opción</option>
                        <option>Consulta por un vehículo</option>
                        <option>Quiero vender mi vehículo</option>
                        <option>Consulta general</option>
                        <option>Otro</option>
                      </select>
                      <div className="invalid-feedback">Selecciona un asunto.</div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="contacto-mensaje" className="form-label">Mensaje</label>
                      <textarea className="form-control" id="contacto-mensaje" rows="4" required minLength={10}></textarea>
                      <div className="invalid-feedback">Cuéntanos brevemente en qué te podemos ayudar.</div>
                    </div>
                    <div className="col-12">
                      {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}
                      <button type="submit" className="boton-principal" disabled={enviando}>Enviar mensaje</button>
                    </div>
                  </div>
                </form>
                ) : (
                  <AvisoSesionRequerida accion="enviarnos un mensaje" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
