import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar.jsx";
import { renderConApp } from "../test/utils.jsx";

describe("ModalSesion - pestañas", () => {
  it("permite ir a Registrarse y volver a Ingresar", async () => {
    const user = userEvent.setup();
    renderConApp(<Navbar />);
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Repetir contraseña")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Registrarse" }));
    expect(screen.getByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
    expect(screen.getByLabelText("Repetir contraseña")).toBeInTheDocument();

    await user.click(document.querySelector(".pestanas-sesion button"));
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Repetir contraseña")).not.toBeInTheDocument();
  });
});
