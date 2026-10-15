document.addEventListener("DOMContentLoaded", function () {
  marcarEnlaceDeNavegacionActivo();
  activarValidacionFormularioSesion();
  mostrarEstadoDelBotonSesion();
  activarClicDelBotonSesion();
});

function marcarEnlaceDeNavegacionActivo() {
  const paginaActual = window.location.pathname.split("/").pop() || "index.html";
  const enlacesDeMenu = document.querySelectorAll(".enlace-menu-principal");

  enlacesDeMenu.forEach(function (enlace) {
    const destinoEnlace = enlace.getAttribute("href");
    if (destinoEnlace === paginaActual) {
      enlace.classList.add("active");
    }
  });
}

function activarValidacionFormularioSesion() {
  const formularioSesion = document.getElementById("formulario-inicio-sesion");
  if (!formularioSesion) {
    return;
  }

  formularioSesion.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const campoCorreo = document.getElementById("sesion-correo");
    const campoClave = document.getElementById("sesion-clave");
    const expresionCorreoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!expresionCorreoValido.test(campoCorreo.value.trim())) {
      campoCorreo.classList.add("is-invalid");
      return;
    }
    campoCorreo.classList.remove("is-invalid");

    if (campoClave.value.trim().length < 6) {
      campoClave.classList.add("is-invalid");
      return;
    }
    campoClave.classList.remove("is-invalid");

    const correoIngresado = campoCorreo.value.trim();
    const nombreDeUsuario = correoIngresado.split("@")[0];

    localStorage.setItem("nombreUsuarioAutoFacil", nombreDeUsuario);
    localStorage.setItem("modoAdministradorAutoFacil", "true");

    alert(
      "Inicio de sesión simulado con éxito. ¡Bienvenido(a), " + nombreDeUsuario + "! " +
      "Ahora tienes permisos de administrador para eliminar autos del catálogo."
    );
    formularioSesion.reset();

    const modalSesionAbierto = document.getElementById("modal-inicio-sesion");
    const instanciaModal = bootstrap.Modal.getInstance(modalSesionAbierto);
    if (instanciaModal) {
      instanciaModal.hide();
    }
    window.location.reload();
  });
}

function mostrarEstadoDelBotonSesion() {
  const botonSesion = document.getElementById("enlace-sesion");
  if (!botonSesion) {
    return;
  }

  const haySesionActiva = localStorage.getItem("modoAdministradorAutoFacil") === "true";

  if (haySesionActiva) {
    botonSesion.textContent = "🔓 Cerrar sesión";
    botonSesion.removeAttribute("data-bs-toggle");
    botonSesion.removeAttribute("data-bs-target");
  } else {
    botonSesion.textContent = "👤 Iniciar sesión";
    botonSesion.setAttribute("data-bs-toggle", "modal");
    botonSesion.setAttribute("data-bs-target", "#modal-inicio-sesion");
  }
}

function activarClicDelBotonSesion() {
  const botonSesion = document.getElementById("enlace-sesion");
  if (!botonSesion) {
    return;
  }

  botonSesion.addEventListener("click", function (evento) {
    const haySesionActiva = localStorage.getItem("modoAdministradorAutoFacil") === "true";
    if (!haySesionActiva) {
      return;
    }

    evento.preventDefault();
    localStorage.removeItem("modoAdministradorAutoFacil");
    localStorage.removeItem("nombreUsuarioAutoFacil");
    mostrarEstadoDelBotonSesion();

    alert("Cerraste sesión. Ahora necesitas iniciar sesión de nuevo para poder eliminar vehículos.");

    if (typeof aplicarFiltrosDeCatalogo === "function") {
      aplicarFiltrosDeCatalogo();
    }
  });
}