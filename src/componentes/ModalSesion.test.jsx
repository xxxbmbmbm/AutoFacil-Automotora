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

describe("ModalSesion", () => {
  it("no se muestra hasta pulsar iniciar sesión", () => {
    renderConApp(<Navbar />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
  });

  it("muestra error con credenciales incorrectas", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), ADMIN.correo);
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(document.querySelector("form button[type=submit]"));
    expect(screen.getByRole("alert")).toHaveTextContent(/incorrectos/);
  });

  it("inicia sesión como administrador", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.type(screen.getByLabelText("Correo electrónico"), ADMIN.correo);
    await user.type(screen.getByLabelText("Contraseña"), ADMIN.clave);
    await user.click(document.querySelector("form button[type=submit]"));
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("registra un usuario normal y valida errores", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.click(screen.getByRole("button", { name: "Registrarse" }));
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();

    await user.type(screen.getByLabelText("Nombre"), "Ana");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "secreto1");
    await user.type(screen.getByLabelText("Repetir contraseña"), "distinta");
    await user.click(document.querySelector("form button[type=submit]"));
    expect(screen.getByRole("alert")).toHaveTextContent(/no coinciden/);

    await user.clear(screen.getByLabelText("Repetir contraseña"));
    await user.type(screen.getByLabelText("Repetir contraseña"), "secreto1");
    await user.click(document.querySelector("form button[type=submit]"));
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("cambia de pestaña limpiando el error", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.click(document.querySelector("form button[type=submit]"));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Registrarse" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("se cierra con la X y al hacer clic fuera, pero no dentro", async () => {
    const user = userEvent.setup();
    await abrir(user);
    await user.click(screen.getByLabelText("Correo electrónico"));
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerrar" }));
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    await user.click(document.querySelector(".modal"));
    expect(screen.queryByLabelText("Correo electrónico")).not.toBeInTheDocument();
  });
});
