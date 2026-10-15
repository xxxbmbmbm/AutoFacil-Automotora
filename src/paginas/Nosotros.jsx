import { Link } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";

const hitos = [
  { t: "Los inicios", d: "Un pequeño equipo comienza a vender sus primeros vehículos usados de forma directa y transparente." },
  { t: "Crecimiento del catálogo", d: "Se suman nuevas marcas y tipos de vehículos, desde hatchbacks urbanos hasta camionetas." },
  { t: "Una plataforma propia", d: "AutoFacil da el salto a la web para que cualquier persona pueda cotizar y filtrar vehículos sin salir de casa." },
  { t: "Hoy", d: "Seguimos creciendo, siempre con el mismo objetivo: que elegir un auto sea una experiencia fácil." },
];

const valores = [
  { i: "🧭", t: "Misión", d: "Simplificar la compra y venta de vehículos, entregando información clara y un trato cercano en cada etapa del proceso." },
  { i: "👁️", t: "Transparencia", d: "Mostramos el precio, el estado y los datos reales de cada vehículo, sin letra chica ni sorpresas." },
  { i: "🤝", t: "Cercanía", d: "Detrás de la pantalla hay personas reales dispuestas a asesorarte, no solo un catálogo." },
];

export default function Nosotros() {
  return (
    <>
      <EncabezadoPagina
        etiqueta="Nuestra historia"
        titulo="Acerca de AutoFacil"
        subtitulo="Somos una automotora pensada para que comprar o vender un vehículo deje de ser complicado."
      />
      <section className="franja-seccion">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <p className="etiqueta-seccion mb-2">Cómo empezamos</p>
              <h2 className="mb-3">Una idea nacida de una mala experiencia comprando un auto</h2>
              <p>
                AutoFacil nació hace unos años, cuando un grupo de amigos con distintas
                profesiones —uno de ventas, otro de tecnología y otro de administración—
                vivió en carne propia lo desordenado que podía ser comprar un vehículo usado
                en Chile: avisos poco claros, precios que cambiaban en la conversación y
                vendedores difíciles de ubicar.
              </p>
              <p className="mb-0">
                De esa frustración compartida surgió la idea de crear un solo lugar, simple
                y directo, donde cualquier persona pudiera revisar el catálogo completo,
                conocer el precio real de cada vehículo y contactar a la automotora sin
                vueltas. Así partió AutoFacil, primero con un puñado de vehículos y, con el
                tiempo, con un catálogo cada vez más variado.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="linea-tiempo ps-4">
                {hitos.map((h, i) => (
                  <div className={"hito-tiempo" + (i === hitos.length - 1 ? " mb-0" : "")} key={h.t}>
                    <h6 className="mb-1">{h.t}</h6>
                    <p className="text-muted mb-0">{h.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="franja-seccion franja-alterna">
        <div className="container">
          <div className="text-center mb-4">
            <p className="etiqueta-seccion mb-1">Lo que nos guía</p>
            <h2>Nuestra misión y valores</h2>
          </div>
          <div className="row g-4">
            {valores.map((v) => (
              <div className="col-md-4" key={v.t}>
                <div className="tarjeta-valor">
                  <span className="icono-valor d-block">{v.i}</span>
                  <h5>{v.t}</h5>
                  <p className="text-muted mb-0">{v.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="franja-seccion text-center">
        <div className="container">
          <h2 className="mb-3">¿Quieres conocer nuestro catálogo?</h2>
          <p className="text-muted mb-4">Revisa los vehículos disponibles o escríbenos si tienes dudas.</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/vehiculos" className="boton-principal">Ver vehículos</Link>
            <Link to="/contacto" className="boton-secundario">Contáctanos</Link>
          </div>
        </div>
      </section>
    </>
  );
}
