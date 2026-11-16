import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import { useSesion } from "../contexto/SesionContext.jsx";
import FormularioVehiculo from "../componentes/FormularioVehiculo.jsx";
import Icono from "../componentes/Icono.jsx";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { formatearPrecioClp, listaDeMarcas } from "../datos/vehiculos.js";

export default function Vehiculos() {
  const { esAdmin, esVendedor } = useSesion();
  const { vehiculos, categorias, cargando, error, agregarVehiculo, eliminarVehiculo } = useVehiculos();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const marca = searchParams.get("marca") || "todas";
  const [tipo, setTipo] = useState("todos");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");

  const tipos = [...new Set(vehiculos.map((v) => v.tipo))];
  const marcas = [...new Set([...listaDeMarcas, ...vehiculos.map((v) => v.marca)])];
  const minimo = precioMin ? Number(precioMin) : 0;
  const maximo = precioMax ? Number(precioMax) : Infinity;

  const filtrados = vehiculos.filter(
    (v) =>
      (marca === "todas" || v.marca === marca) &&
      (tipo === "todos" || v.tipo === tipo) &&
      v.precio >= minimo &&
      v.precio <= maximo
  );

  function cambiarMarca(valor) {
    setSearchParams(valor === "todas" ? {} : { marca: valor });
  }

  function limpiar() {
    setSearchParams({});
    setTipo("todos");
    setPrecioMin("");
    setPrecioMax("");
  }

  async function eliminar(v) {
    if (!window.confirm(`¿Eliminar ${v.marca} ${v.modelo} del catálogo?`)) return;
    const problema = await eliminarVehiculo(v.id);
    if (problema) window.alert(problema);
  }

  // Devuelve el error al formulario para que lo muestre; si se guardó, lo cierra.
  async function guardar(datos) {
    const problema = await agregarVehiculo(datos);
    if (!problema) setMostrarForm(false);
    return problema;
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Catálogo"
        titulo="Nuestros vehículos"
        subtitulo="Filtra por marca, tipo de vehículo o rango de precio para encontrar la opción que más te acomode"
      />
      <section className="franja-seccion pt-4">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-3">
              <div className="panel-filtros">
                <h5 className="mb-3">Filtrar</h5>
                <div className="mb-3">
                  <label htmlFor="filtro-marca" className="form-label">Marca</label>
                  <select
                    className="form-select"
                    id="filtro-marca"
                    value={marca}
                    onChange={(e) => cambiarMarca(e.target.value)}
                  >
                    <option value="todas">Todas las marcas</option>
                    {marcas.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="filtro-tipo-vehiculo" className="form-label">Tipo de vehículo</label>
                  <select
                    className="form-select"
                    id="filtro-tipo-vehiculo"
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                  >
                    <option value="todos">Todos los tipos</option>
                    {tipos.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="filtro-precio-minimo" className="form-label">Precio mínimo (CLP)</label>
                  <input
                    type="number" min="0" step="500000" className="form-control"
                    id="filtro-precio-minimo" placeholder="Ej: 7000000"
                    value={precioMin} onChange={(e) => setPrecioMin(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="filtro-precio-maximo" className="form-label">Precio máximo (CLP)</label>
                  <input
                    type="number" min="0" step="500000" className="form-control"
                    id="filtro-precio-maximo" placeholder="Ej: 15000000"
                    value={precioMax} onChange={(e) => setPrecioMax(e.target.value)}
                  />
                </div>
                <button type="button" className="boton-secundario w-100" onClick={limpiar}>
                  Limpiar filtros
                </button>
              </div>
            </div>

            <div className="col-lg-9">
              {esAdmin && (
                <div className="barra-admin">
                  <button type="button" className="boton-principal" onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? "Cerrar formulario" : <><Icono nombre="mas" tamano={16} />Agregar vehículo</>}
                  </button>
                </div>
              )}
              {esAdmin && mostrarForm && (
                <FormularioVehiculo categorias={categorias} onGuardar={guardar} onCancelar={() => setMostrarForm(false)} />
              )}
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {marca !== "todas" && (
                <p className="mb-2">
                  Mostrando solo <strong>{marca}</strong>{" "}
                  <button type="button" className="btn btn-link p-0 align-baseline texto-rosa" onClick={() => cambiarMarca("todas")}>
                    Ver todas las marcas
                  </button>
                </p>
              )}
              <p className="conteo-resultados">
                {cargando ? "Cargando vehículos…" : <><span>{filtrados.length}</span> vehículos encontrados</>}
              </p>
              <div className="row g-4">
                {filtrados.map((v) => {
                  const oferta = v.precioAnterior != null;
                  const vendido = v.estado === "VENDIDO";
                  return (
                    <div className="col-sm-6 col-lg-4 col-xl-3" key={v.id}>
                      <div className="tarjeta-vehiculo">
                        <div className="cabecera-vehiculo esqueleto" style={{ backgroundColor: v.colorFondo }}>
                          <img className="foto-vehiculo" src={v.imagen} alt={`Foto de ${v.marca} ${v.modelo}`} />
                          {oferta && <span className="insignia-promocion">Oferta</span>}
                          <span className="insignia-tipo">{v.tipo}</span>
                        </div>
                        <div className="cuerpo-tarjeta">
                          <p className="marca-modelo mb-1">{v.marca} {v.modelo} {v.anio}</p>
                          <p className="detalle-vehiculo mb-0">{v.kilometraje} &middot; {v.transmision}</p>
                          <div className="corte-ficha" />
                          <p className="precio-vehiculo mb-3">
                            {oferta && <span className="precio-anterior">{formatearPrecioClp(v.precioAnterior)}</span>}
                            {formatearPrecioClp(v.precio)}
                          </p>
                          {vendido && <p className="mb-2"><span className="estado-chip estado-destacado">Vendido</span></p>}
                          {!esVendedor && !vendido && (
                            <Link className="boton-comprar" to={`/comprar?id=${v.id}`}>Comprar</Link>
                          )}
                          <Link className="enlace-flecha d-inline-flex mt-2" to={`/vehiculos/${v.id}`}>
                            Ver detalle <Icono nombre="flecha" tamano={14} />
                          </Link>
                          {esAdmin && (
                            <button type="button" className="boton-eliminar-vehiculo mt-2" onClick={() => eliminar(v)}>
                              <Icono nombre="basurero" tamano={16} />Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!cargando && filtrados.length === 0 && (
                <div className="mensaje-sin-resultados" style={{ display: "block" }}>
                  <Icono nombre="buscar" tamano={24} />
                  No encontramos vehículos que coincidan con estos filtros. Prueba cambiando o limpiando los filtros
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
