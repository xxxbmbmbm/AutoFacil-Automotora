import { useState } from "react";

const inicial = {
  marca: "", modelo: "", anio: new Date().getFullYear(), categoriaId: "", precio: "",
  precioAnterior: "", km: "", transmision: "Automática", imagen: "", colorFondo: "#141416",
};

// onGuardar devuelve un mensaje de error del servidor, o null si el vehículo se guardó.
export default function FormularioVehiculo({ categorias, onGuardar, onCancelar }) {
  const [c, setC] = useState(inicial);
  const [validado, setValidado] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo) => (e) => setC({ ...c, [campo]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setValidado(true);
    if (!e.currentTarget.checkValidity()) return;
    const precioAnterior = c.precioAnterior ? Number(c.precioAnterior) : null;
    setEnviando(true);
    const problema = await onGuardar({
      marca: c.marca.trim(),
      modelo: c.modelo.trim(),
      anio: Number(c.anio),
      categoriaId: Number(c.categoriaId),
      precio: Number(c.precio),
      precioAnterior: precioAnterior && precioAnterior > Number(c.precio) ? precioAnterior : null,
      kilometraje: Number(c.km),
      transmision: c.transmision,
      imagen: c.imagen.trim(),
      colorFondo: c.colorFondo,
    });
    setEnviando(false);
    setError(problema || "");
  }

  return (
    <div className="panel-filtros mb-4">
      <h5 className="mb-3">Agregar vehículo</h5>
      <form className={validado ? "was-validated" : ""} onSubmit={enviar} noValidate>
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-marca">Marca</label>
            <input id="v-marca" className="form-control" value={c.marca} onChange={cambiar("marca")} required />
            <div className="invalid-feedback">Obligatorio.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-modelo">Modelo</label>
            <input id="v-modelo" className="form-control" value={c.modelo} onChange={cambiar("modelo")} required />
            <div className="invalid-feedback">Obligatorio.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-anio">Año</label>
            <input id="v-anio" type="number" min="1950" max="2100" className="form-control" value={c.anio} onChange={cambiar("anio")} required />
            <div className="invalid-feedback">Año inválido.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-tipo">Tipo</label>
            <select id="v-tipo" className="form-select" value={c.categoriaId} onChange={cambiar("categoriaId")} required>
              <option value="" disabled>Selecciona un tipo</option>
              {categorias.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
            <div className="invalid-feedback">Obligatorio.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-precio">Precio (CLP)</label>
            <input id="v-precio" type="number" min="1" className="form-control" value={c.precio} onChange={cambiar("precio")} required />
            <div className="invalid-feedback">Ingresa un precio.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-anterior">Precio anterior (opcional)</label>
            <input id="v-anterior" type="number" min="0" className="form-control" value={c.precioAnterior} onChange={cambiar("precioAnterior")} />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-km">Kilometraje</label>
            <input id="v-km" type="number" min="0" className="form-control" value={c.km} onChange={cambiar("km")} required />
            <div className="invalid-feedback">Obligatorio.</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-trans">Transmisión</label>
            <select id="v-trans" className="form-select" value={c.transmision} onChange={cambiar("transmision")}>
              <option>Automática</option>
              <option>Mecánica</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="v-color">Color de fondo</label>
            <input id="v-color" type="color" className="form-control form-control-color w-100" value={c.colorFondo} onChange={cambiar("colorFondo")} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="v-imagen">URL de la imagen</label>
            <input id="v-imagen" type="url" className="form-control" value={c.imagen} onChange={cambiar("imagen")} placeholder="https://…" required />
            <div className="invalid-feedback">Ingresa una URL válida que empiece con https://.</div>
          </div>
          {error && <div className="col-12"><div className="alert alert-danger py-2 mb-0" role="alert">{error}</div></div>}
          <div className="col-12 d-flex gap-2 flex-wrap">
            <button type="submit" className="boton-principal" disabled={enviando}>Guardar vehículo</button>
            <button type="button" className="boton-secundario" onClick={onCancelar}>Cancelar</button>
          </div>
        </div>
      </form>
    </div>
  );
}
