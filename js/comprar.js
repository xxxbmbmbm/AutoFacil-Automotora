document.addEventListener("DOMContentLoaded", function () {
  const vehiculoComprado = obtenerVehiculoDesdeUrl();
  mostrarResumenDeCompra(vehiculoComprado);
  activarEnvioDeFormularioCompra(vehiculoComprado);
});

function obtenerVehiculoDesdeUrl() {
  const parametrosUrl = new URLSearchParams(window.location.search);
  const idVehiculo = Number(parametrosUrl.get("id"));

  return listaDeVehiculos.find(function (vehiculo) {
    return vehiculo.id === idVehiculo;
  });
}

function mostrarResumenDeCompra(vehiculo) {
  const contenedorResumen = document.getElementById("resumen-compra");
  const contenedorFormulario = document.getElementById("contenedor-formulario-compra");
  if (!contenedorResumen) {
    return;
  }

  if (!vehiculo) {
    contenedorResumen.innerHTML = `
      <p class="mb-3">No encontramos el vehículo seleccionado.</p>
      <a href="vehiculos.html" class="boton-secundario">Volver al catálogo</a>
    `;
    if (contenedorFormulario) {
      contenedorFormulario.style.display = "none";
    }
    return;
  }

  contenedorResumen.innerHTML = `
    <h5 class="mb-3">Estás comprando</h5>
    <img src="${vehiculo.imagen}" alt="Foto de ${vehiculo.marca} ${vehiculo.modelo}" class="foto-resumen-compra mb-3">
    <p class="marca-modelo mb-1">${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.anio}</p>
    <p class="detalle-vehiculo mb-2">${vehiculo.kilometraje} &middot; ${vehiculo.transmision}</p>
    <p class="precio-vehiculo mb-0">${formatearPrecioClp(vehiculo.precio)}</p>
  `;
}

function activarEnvioDeFormularioCompra(vehiculo) {
  const formularioCompra = document.getElementById("formulario-compra");
  if (!formularioCompra || !vehiculo) {
    return;
  }

  formularioCompra.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!formularioCompra.checkValidity()) {
      formularioCompra.classList.add("was-validated");
      return;
    }
    formularioCompra.classList.add("was-validated");

    alert(
      "¡Compra exitosa! Gracias por comprar tu " + vehiculo.marca + " " + vehiculo.modelo + ". " +
      "Nuestro equipo se pondrá en contacto contigo para coordinar la entrega."
    );

    formularioCompra.reset();
    formularioCompra.classList.remove("was-validated");
    window.location.href = "vehiculos.html";
  });
}