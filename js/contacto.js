document.addEventListener("DOMContentLoaded", function () {
  activarEnvioDeFormularioContacto();
});

function activarEnvioDeFormularioContacto() {
  const formularioContacto = document.getElementById("formulario-contacto");
  if (!formularioContacto) {
    return;
  }

  formularioContacto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!validarCamposDelFormulario(formularioContacto)) {
      return;
    }

    const nombreIngresado = document.getElementById("contacto-nombre").value.trim();

    alert(
      "¡Gracias, " + nombreIngresado + "! Tu mensaje fue enviado con éxito. " +
      "Un asesor de AutoFacil se pondrá en contacto contigo a la brevedad."
    );

    formularioContacto.reset();
    formularioContacto.classList.remove("was-validated");
  });
}

function validarCamposDelFormulario(formulario) {
  if (!formulario.checkValidity()) {
    formulario.classList.add("was-validated");
    return false;
  }
  formulario.classList.add("was-validated");
  return true;
}
