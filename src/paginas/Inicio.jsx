import { Link } from "react-router-dom";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { listaDeMarcas, formatearPrecioClp } from "../datos/vehiculos.js";

const beneficios = [
  { icono: "🛡️", titulo: "Compra segura", texto: "Todos nuestros vehículos son revisados antes de salir a la venta." },
  { icono: "🏷️", titulo: "Precios claros", texto: "Sin letra chica ni costos escondidos, con ofertas destacadas." },
  { icono: "🎧", titulo: "Asesoría real", texto: "Un equipo de personas listo para ayudarte a decidir mejor." },
];

export default function Inicio() {
  const { vehiculos } = useVehiculos();
  return (
    <>
      <header className="seccion-hero">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <p className="etiqueta-hero text-uppercase">
                Automotora de confianza
              </p>
              <h1 className="titulo-hero mb-3">
                Encuentra tu próximo auto <span>de forma fácil</span>
              </h1>
              <p className="subtitulo-hero mb-4">
                En AutoFacil reunimos vehículos nuevos y usados de distintas marcas en un solo
                lugar, con información clara y un equipo real detrás para ayudarte a elegir.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/vehiculos" className="boton-principal">Ver vehículos</Link>
                <Link to="/contacto" className="boton-secundario" style={{ borderColor: "#fff", color: "#fff" }}>
                  Contáctanos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="franja-seccion">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-2">
            <div>
              <p className="etiqueta-seccion mb-1">Vitrina</p>
              <h2 className="mb-0">Algunos de nuestros vehículos</h2>
            </div>
            <Link to="/vehiculos" className="fw-semibold texto-rosa">Ver catálogo completo &rarr;</Link>
          </div>
          <div className="row g-3">
            {vehiculos.slice(0, 6).map((v) => (
              <div className="col-6 col-md-4 col-lg-2" key={v.id}>
                <Link to="/vehiculos" className="text-decoration-none text-reset">
                  <div className="tarjeta-galeria">
                    <div className="icono-vehiculo" style={{ backgroundColor: v.colorFondo }}>
                      <img className="foto-vehiculo" src={v.imagen} alt={`Foto de ${v.marca} ${v.modelo}`} />
                    </div>
                    <div className="cuerpo-tarjeta">
                      <p className="marca-modelo mb-1">{v.marca} {v.modelo}</p>
                      <p className="precio-vehiculo mb-0">{formatearPrecioClp(v.precio)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="seccion-marcas">
        <div className="container">
          <div className="text-center mb-4">
            <p className="etiqueta-seccion mb-1">Nuestros aliados</p>
            <h2>Marcas con las que trabajamos</h2>
          </div>
          <div className="row g-3">
            {listaDeMarcas.map((marca) => (
              <div className="col-6 col-md-3 col-lg-2" key={marca}>
                <Link
                  to={`/vehiculos?marca=${encodeURIComponent(marca)}`}
                  className="insignia-marca text-decoration-none"
                  aria-label={`Ver vehículos ${marca}`}
                >
                  {marca}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="franja-seccion franja-alterna">
        <div className="container">
          <div className="row g-4 text-center">
            {beneficios.map((b) => (
              <div className="col-md-4" key={b.titulo}>
                <span className="fs-1 texto-rosa">{b.icono}</span>
                <h5 className="mt-3">{b.titulo}</h5>
                <p className="text-muted mb-0">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="franja-seccion text-center">
        <div className="container">
          <h2 className="mb-3">¿Listo para encontrar tu próximo vehículo?</h2>
          <p className="text-muted mb-4">Revisa el catálogo completo o escríbenos y te ayudamos a elegir.</p>
          <Link to="/vehiculos" className="boton-principal">Explorar catálogo</Link>
        </div>
      </section>
    </>
  );
}
