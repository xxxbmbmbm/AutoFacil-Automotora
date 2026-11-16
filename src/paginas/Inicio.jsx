import { Link } from "react-router-dom";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { listaDeMarcas, formatearPrecioClp } from "../datos/vehiculos.js";
import Icono from "../componentes/Icono.jsx";

const beneficios = [
  { icono: "escudo", titulo: "Compra segura", texto: "Todos nuestros vehículos son revisados antes de salir a la venta." },
  { icono: "etiqueta", titulo: "Precios claros", texto: "Sin letra chica ni costos escondidos, con ofertas destacadas." },
  { icono: "auricular", titulo: "Asesoría real", texto: "Un equipo de personas listo para ayudarte a decidir mejor." },
];

export default function Inicio() {
  const { vehiculos } = useVehiculos();
  // La última oferta del catálogo, para no repetir un auto que ya sale en la vitrina
  const destacado = vehiculos.findLast((v) => v.precioAnterior != null);

  return (
    <>
      <header className="seccion-hero">
        <div className="container">
          <div className="row align-items-center g-0">
            <div className="col-lg-6 entrada">
              <h1 className="titulo-hero">
                Encuentra tu próximo auto <span>de forma fácil</span>
              </h1>
              <p className="subtitulo-hero mb-0">
                En AutoFacil reunimos vehículos nuevos y usados de distintas marcas en un solo
                lugar, con información clara y un equipo real detrás para ayudarte a elegir.
              </p>
              <div className="acciones-hero">
                <Link to="/vehiculos" className="boton-principal">Ver vehículos</Link>
                <Link to="/contacto" className="boton-secundario">Contáctanos</Link>
              </div>
            </div>
            {destacado && (
              <div className="col-lg-6 entrada">
                <article className="ficha-destacada">
                  <div className="esqueleto">
                    <img
                      className="foto-ficha"
                      src={destacado.imagen}
                      alt={`${destacado.marca} ${destacado.modelo} en oferta`}
                      width="520"
                      height="325"
                    />
                  </div>
                  <div className="cuerpo-ficha">
                    <div className="cabeza-ficha">
                      <h2 className="nombre-ficha">{destacado.marca} {destacado.modelo} {destacado.anio}</h2>
                      <span className="sello-ficha">En oferta</span>
                    </div>
                    <p className="ficha-specs mb-0">
                      {destacado.tipo} &middot; {destacado.kilometraje} &middot; {destacado.transmision}
                    </p>
                    <div className="corte-ficha" />
                    <div className="pie-ficha">
                      <div>
                        <p className="ahorro-ficha">
                          <s>{formatearPrecioClp(destacado.precioAnterior)}</s> &middot; ahorras{" "}
                          {formatearPrecioClp(destacado.precioAnterior - destacado.precio)}
                        </p>
                        <p className="precio-ficha mb-0">{formatearPrecioClp(destacado.precio)}</p>
                      </div>
                      <Link className="enlace-ficha" to={`/comprar?id=${destacado.id}`}>
                        Ver oferta <Icono nombre="flecha" tamano={16} />
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="franja-seccion pt-0">
        <div className="container">
          <div className="cabeza-seccion">
            <div>
              <p className="etiqueta-seccion">Vitrina</p>
              <h2 className="mb-0">Algunos de nuestros vehículos</h2>
            </div>
            <Link to="/vehiculos" className="enlace-flecha">
              Ver catálogo completo <Icono nombre="flecha" tamano={16} />
            </Link>
          </div>
          <div className="row g-3">
            {vehiculos.slice(0, 6).map((v) => (
              <div className="col-6 col-md-4 col-lg-2" key={v.id}>
                <Link to="/vehiculos" className="text-decoration-none text-reset">
                  <div className="tarjeta-galeria">
                    <div className="icono-vehiculo esqueleto" style={{ backgroundColor: v.colorFondo }}>
                      <img className="foto-vehiculo" src={v.imagen} alt={`Foto de ${v.marca} ${v.modelo}`} />
                    </div>
                    <div className="cuerpo-tarjeta">
                      <p className="marca-modelo">{v.marca} {v.modelo}</p>
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
          <div className="cabeza-seccion">
            <div>
              <p className="etiqueta-seccion">Nuestros aliados</p>
              <h2 className="mb-0">Marcas con las que trabajamos</h2>
            </div>
          </div>
          <div className="row g-2 row-cols-2 row-cols-md-5">
            {listaDeMarcas.map((marca) => (
              <div className="col" key={marca}>
                <Link
                  to={`/vehiculos?marca=${encodeURIComponent(marca)}`}
                  className="insignia-marca"
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
          <div className="row g-5">
            {beneficios.map((b) => (
              <div className="col-md-4 beneficio" key={b.titulo}>
                <Icono nombre={b.icono} tamano={20} />
                <h5>{b.titulo}</h5>
                <p className="text-muted mb-0">{b.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="franja-seccion">
        <div className="container">
          <div className="cierre">
            <div>
              <h2>¿Listo para encontrar tu próximo vehículo?</h2>
              <p className="text-muted mb-0">Revisa el catálogo completo o escríbenos y te ayudamos a elegir</p>
            </div>
            <Link to="/vehiculos" className="boton-principal">Explorar catálogo</Link>
          </div>
        </div>
      </section>
    </>
  );
}
