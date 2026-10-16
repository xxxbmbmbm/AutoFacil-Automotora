import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar.jsx";
import { renderConApp } from "../test/utils.jsx";
import { ADMIN } from "../datos/admin.js";

async function abrir(user) {
  renderConApp(<Navbar />);
  await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
}

const enviar = (user) => user.click(document.querySelector("form button[type=submit]"));
const irARegistro = (user) => user.click(screen.getByRole("button", { name: "Registrarse" }));

async function llenarRegistro(user, { nombre, correo, clave, confirmar }) {
  if (nombre) await user.type(screen.getByLabelText("Nombre"), nombre);
  if (correo) await user.type(screen.getByLabelText("Correo electrónico"), correo);
  if (clave) await user.type(screen.getByLabelText("Contraseña"), clave);
  if (confirmar) await user.type(screen.getByLabelText("Repetir contraseña"), confirmar);
}

describe("ModalSesion - ingresar", () => {
  it("pide un correo válido si el campo está vacío", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido.");
  });

  it("pide la contraseña si solo se escribió el correo", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu contraseña.");
  });

  it("rechaza un usuario que no existe", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), "nadie@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreto1");
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
  });

  it("los campos reflejan lo que se escribe", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "abc");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("ana@correo.cl");
    expect(screen.getByLabelText("Contraseña")).toHaveValue("abc");
  });

  it("indica el tipo de autocompletado según la pestaña", async () => {
    const user = userEvent.setup();
    await abrir(user);
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "current-password");
    await irARegistro(user);
    expect(screen.getByLabelText("Contraseña")).toHaveAttribute("autocomplete", "new-password");
  });
});

describe("ModalSesion - registrarse", () => {
  it("exige un nombre de al menos 2 caracteres", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "A", correo: "a@correo.cl", clave: "secreto1", confirmar: "secreto1" });
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu nombre.");
  });

  it("exige un correo válido", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Ana", correo: "no-es-correo", clave: "secreto1", confirmar: "secreto1" });
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido.");
  });

  it("exige una contraseña de al menos 6 caracteres", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Ana", correo: "ana@correo.cl", clave: "123", confirmar: "123" });
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent(/al menos 6 caracteres/);
  });

  it("no permite registrar el correo reservado del administrador", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Falso", correo: ADMIN.correo, clave: "secreto1", confirmar: "secreto1" });
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ese correo está reservado.");
  });

  it("permite registrarse, cerrar sesión, y volver a ingresar con la misma cuenta", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Ana", correo: "ana@correo.cl", clave: "secreto1", confirmar: "secreto1" });
    await enviar(user);
    expect(screen.getByText(/Ana/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(screen.queryByText(/Ana/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    await user.click(document.querySelector(".pestanas-sesion button"));
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreto1");
    await enviar(user);
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
  });

  it("no permite registrar dos veces el mismo correo", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Ana", correo: "ana@correo.cl", clave: "secreto1", confirmar: "secreto1" });
    await enviar(user);

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    await irARegistro(user);
    await llenarRegistro(user, { nombre: "Otra Ana", correo: "ana@correo.cl", clave: "secreto2", confirmar: "secreto2" });
    await enviar(user);
    expect(screen.getByRole("alert")).toHaveTextContent("Ya existe una cuenta con ese correo.");
  });
});

describe("ModalSesion - pestañas y cierre", () => {
  it("marca como activa la pestaña elegida", async () => {
    const user = userEvent.setup();
    await abrir(user);
    const [ingresar, registrarse] = document.querySelectorAll(".pestanas-sesion button");
    expect(ingresar).toHaveClass("activa");
    expect(registrarse).not.toHaveClass("activa");
    await user.click(registrarse);
    expect(registrarse).toHaveClass("activa");
    expect(ingresar).not.toHaveClass("activa");
  });

  it("al cerrar con la X se borran los campos y el error", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await enviar(user);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("muestra el fondo oscuro del modal y la nota de demostración", async () => {
    const user = userEvent.setup();
    await abrir(user);
    expect(document.querySelector(".modal-backdrop")).toBeInTheDocument();
    expect(screen.getByText(/los datos se guardan solo en este navegador/)).toBeInTheDocument();
  });
});
