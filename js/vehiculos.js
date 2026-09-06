let vehiculosDisponibles = listaDeVehiculos.slice();

document.addEventListener("DOMContentLoaded", function () {
  construirOpcionesDeTipoVehiculo();
  dibujarCatalogoDeVehiculos(vehiculosDisponibles);
  activarEscuchadoresDeFiltros();
  activarEscuchadorDeEliminacion();
});

function esModoAdministrador() {
  return localStorage.getItem("modoAdministradorAutoFacil") === "true";
}

function construirOpcionesDeTipoVehiculo() {
  const selectorTipo = document.getElementById("filtro-tipo-vehiculo");
  if (!selectorTipo) {
    return;
  }

  const tiposUnicos = [...new Set(vehiculosDisponibles.map((vehiculo) => vehiculo.tipo))];
  tiposUnicos.forEach(function (tipo) {
    const nuevaOpcion = document.createElement("option");
    nuevaOpcion.value = tipo;
    nuevaOpcion.textContent = tipo;
    selectorTipo.appendChild(nuevaOpcion);
  });
}

function dibujarCatalogoDeVehiculos(vehiculosAMostrar) {
  const contenedorCatalogo = document.getElementById("contenedor-catalogo-vehiculos");
  const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
  const contadorResultados = document.getElementById("contador-resultados");

  if (!contenedorCatalogo) {
    return;
  }

  if (contadorResultados) {
    contadorResultados.textContent = vehiculosAMostrar.length;
  }

  if (vehiculosAMostrar.length === 0) {
    contenedorCatalogo.innerHTML = "";
    if (mensajeSinResultados) {
      mensajeSinResultados.style.display = "block";
    }
    return;
  }

  if (mensajeSinResultados) {
    mensajeSinResultados.style.display = "none";
  }

  const administradorActivo = esModoAdministrador();

  let htmlCatalogo = "";
  vehiculosAMostrar.forEach(function (vehiculo) {
    const tieneDescuento = vehiculo.precioAnterior !== null;
    const bloquePrecioAnterior = tieneDescuento
      ? `<span class="precio-anterior">${formatearPrecioClp(vehiculo.precioAnterior)}</span>`
      : "";
    const insigniaPromocion = tieneDescuento
      ? `<span class="insignia-promocion">Oferta</span>`
      : "";

    const botonEliminar = administradorActivo
      ? `<button type="button" class="boton-eliminar-vehiculo mt-2" data-id="${vehiculo.id}">
           🗑️ Eliminar
         </button>`
      : "";

    htmlCatalogo += `
      <div class="col-sm-6 col-lg-4 col-xl-3">
        <div class="tarjeta-vehiculo" data-tipo="${vehiculo.tipo}" data-precio="${vehiculo.precio}">
          <div class="cabecera-vehiculo" style="background-color:${vehiculo.colorFondo};">
            <img class="foto-vehiculo" src="${vehiculo.imagen}" alt="Foto de ${vehiculo.marca} ${vehiculo.modelo}">
            ${insigniaPromocion}
            <span class="insignia-tipo">${vehiculo.tipo}</span>
          </div>
          <div class="cuerpo-tarjeta">
            <p class="marca-modelo mb-1">${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}</p>
            <p class="detalle-vehiculo mb-2">${vehiculo.kilometraje} &middot; ${vehiculo.transmision}</p>
            <p class="precio-vehiculo mb-2">${bloquePrecioAnterior}${formatearPrecioClp(vehiculo.precio)}</p>
            <a class="boton-comprar" href="comprar.html?id=${vehiculo.id}">
              🛒 Comprar
            </a>
            ${botonEliminar}
          </div>
        </div>
      </div>
    `;
  });

  contenedorCatalogo.innerHTML = htmlCatalogo;
}

function aplicarFiltrosDeCatalogo() {
  const tipoSeleccionado = document.getElementById("filtro-tipo-vehiculo").value;
  const precioMinimoIngresado = document.getElementById("filtro-precio-minimo").value;
  const precioMaximoIngresado = document.getElementById("filtro-precio-maximo").value;

  const precioMinimo = precioMinimoIngresado ? Number(precioMinimoIngresado) : 0;
  const precioMaximo = precioMaximoIngresado ? Number(precioMaximoIngresado) : Infinity;

  const vehiculosFiltrados = vehiculosDisponibles.filter(function (vehiculo) {
    const coincideTipo = tipoSeleccionado === "todos" || vehiculo.tipo === tipoSeleccionado;
    const coincidePrecio = vehiculo.precio >= precioMinimo && vehiculo.precio <= precioMaximo;
    return coincideTipo && coincidePrecio;
  });

  dibujarCatalogoDeVehiculos(vehiculosFiltrados);
}


function activarEscuchadoresDeFiltros() {
  const selectorTipo = document.getElementById("filtro-tipo-vehiculo");
  const campoPrecioMinimo = document.getElementById("filtro-precio-minimo");
  const campoPrecioMaximo = document.getElementById("filtro-precio-maximo");
  const botonLimpiarFiltros = document.getElementById("boton-limpiar-filtros");

  if (selectorTipo) {
    selectorTipo.addEventListener("change", aplicarFiltrosDeCatalogo);
  }
  if (campoPrecioMinimo) {
    campoPrecioMinimo.addEventListener("input", aplicarFiltrosDeCatalogo);
  }
  if (campoPrecioMaximo) {
    campoPrecioMaximo.addEventListener("input", aplicarFiltrosDeCatalogo);
  }
  if (botonLimpiarFiltros) {
    botonLimpiarFiltros.addEventListener("click", function () {
      selectorTipo.value = "todos";
      campoPrecioMinimo.value = "";
      campoPrecioMaximo.value = "";
      dibujarCatalogoDeVehiculos(vehiculosDisponibles);
    });
  }
}

function activarEscuchadorDeEliminacion() {
  const contenedorCatalogo = document.getElementById("contenedor-catalogo-vehiculos");
  if (!contenedorCatalogo) {
    return;
  }

  contenedorCatalogo.addEventListener("click", function (evento) {
    const botonPresionado = evento.target.closest(".boton-eliminar-vehiculo");
    if (!botonPresionado) {
      return;
    }

    const idAEliminar = Number(botonPresionado.dataset.id);
    vehiculosDisponibles = vehiculosDisponibles.filter(function (vehiculo) {
      return vehiculo.id !== idAEliminar;
    });

    aplicarFiltrosDeCatalogo();
  });
}