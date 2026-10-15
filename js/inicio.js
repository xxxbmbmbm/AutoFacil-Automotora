document.addEventListener("DOMContentLoaded", function () {
  mostrarGaleriaRapidaDeInicio();
  mostrarLogotiposDeMarcas();
});

function mostrarGaleriaRapidaDeInicio() {
  const contenedorGaleria = document.getElementById("contenedor-galeria-inicio");
  if (!contenedorGaleria) {
    return;
  }

  const vehiculosDestacados = listaDeVehiculos.slice(0, 6);
  let htmlGaleria = "";

  vehiculosDestacados.forEach(function (vehiculo) {
    htmlGaleria += `
      <div class="col-6 col-md-4 col-lg-2">
        <a href="vehiculos.html" class="text-decoration-none text-reset">
          <div class="tarjeta-galeria">
            <div class="icono-vehiculo" style="background-color:${vehiculo.colorFondo};">
              <img class="foto-vehiculo" src="${vehiculo.imagen}" alt="Foto de ${vehiculo.marca} ${vehiculo.modelo}">
            </div>
            <div class="cuerpo-tarjeta">
              <p class="marca-modelo mb-1">${vehiculo.marca} ${vehiculo.modelo}</p>
              <p class="precio-vehiculo mb-0">${formatearPrecioClp(vehiculo.precio)}</p>
            </div>
          </div>
        </a>
      </div>
    `;
  });

  contenedorGaleria.innerHTML = htmlGaleria;
}

function mostrarLogotiposDeMarcas() {
  const contenedorMarcas = document.getElementById("contenedor-marcas");
  if (!contenedorMarcas) {
    return;
  }

  let htmlMarcas = "";
  listaDeMarcas.forEach(function (marca) {
    htmlMarcas += `
      <div class="col-6 col-md-3 col-lg-2">
        <div class="insignia-marca">${marca}</div>
      </div>
    `;
  });

  contenedorMarcas.innerHTML = htmlMarcas;
}