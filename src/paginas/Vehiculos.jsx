import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EncabezadoPagina from "../componentes/EncabezadoPagina.jsx";
import { useSesion } from "../contexto/SesionContext.jsx";
import FormularioVehiculo from "../componentes/FormularioVehiculo.jsx";
import { useVehiculos } from "../contexto/VehiculosContext.jsx";
import { formatearPrecioClp, listaDeMarcas } from "../datos/vehiculos.js";

export default function Vehiculos() {
  const { esAdmin } = useSesion();
  const { vehiculos, agregarVehiculo, eliminarVehiculo, restablecerCatalogo } = useVehiculos();
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

  function eliminar(v) {
    if (window.confirm(`¿Eliminar ${v.marca} ${v.modelo} del catálogo?`)) eliminarVehiculo(v.id);
  }

  function guardar(datos) {
    agregarVehiculo(datos);
    setMostrarForm(false);
  }

  function restablecer() {
    if (window.confirm("¿Restablecer el catálogo original? Se perderán los cambios.")) restablecerCatalogo();
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Catálogo"
        titulo="Nuestros vehículos"
        subtitulo="Filtra por marca, tipo de vehículo o rango de precio para encontrar la opción que más te acomode."
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
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <button type="button" className="boton-principal" onClick={() => setMostrarForm(!mostrarForm)}>
                    {mostrarForm ? "Cerrar formulario" : "➕ Agregar vehículo"}
                  </button>
                  <button type="button" className="boton-secundario" onClick={restablecer}>↺ Restablecer catálogo</button>
                </div>
              )}
              {esAdmin && mostrarForm && (
                <FormularioVehiculo tipos={tipos} onGuardar={guardar} onCancelar={() => setMostrarForm(false)} />
              )}
              {marca !== "todas" && (
                <p className="mb-2">
                  Mostrando solo <strong>{marca}</strong>{" "}
                  <button type="button" className="btn btn-link p-0 align-baseline texto-rosa" onClick={() => cambiarMarca("todas")}>
                    Ver todas las marcas
                  </button>
                </p>
              )}
              <p className="text-muted mb-3">
                <span>{filtrados.length}</span> vehículos encontrados
              </p>
              <div className="row g-4">
                {filtrados.map((v) => {
                  const oferta = v.precioAnterior !== null;
                  return (
                    <div className="col-sm-6 col-lg-4 col-xl-3" key={v.id}>
                      <div className="tarjeta-vehiculo">
                        <div className="cabecera-vehiculo" style={{ backgroundColor: v.colorFondo }}>
                          <img className="foto-vehiculo" src={v.imagen} alt={`Foto de ${v.marca} ${v.modelo}`} />
                          {oferta && <span className="insignia-promocion">Oferta</span>}
                          <span className="insignia-tipo">{v.tipo}</span>
                        </div>
                        <div className="cuerpo-tarjeta">
                          <p className="marca-modelo mb-1">{v.marca} {v.modelo} {v.anio}</p>
                          <p className="detalle-vehiculo mb-2">{v.kilometraje} &middot; {v.transmision}</p>
                          <p className="precio-vehiculo mb-2">
                            {oferta && <span className="precio-anterior">{formatearPrecioClp(v.precioAnterior)}</span>}
                            {formatearPrecioClp(v.precio)}
                          </p>
                          <Link className="boton-comprar" to={`/comprar?id=${v.id}`}>🛒 Comprar</Link>
                          {esAdmin && (
                            <button type="button" className="boton-eliminar-vehiculo mt-2" onClick={() => eliminar(v)}>
                              🗑️ Eliminar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {filtrados.length === 0 && (
                <div className="mensaje-sin-resultados" style={{ display: "block" }}>
                  <span className="fs-1 d-block mb-2">🔍</span>
                  No encontramos vehículos que coincidan con estos filtros. Prueba cambiando o limpiando los filtros.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
