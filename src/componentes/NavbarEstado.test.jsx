import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar.jsx";
import { renderConApp } from "../test/utils.jsx";
import { CLAVE_SESION, CLAVE_USUARIOS } from "../contexto/SesionContext.jsx";

function iniciarComoUsuario() {
  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify([{ nombre: "Ana", correo: "ana@correo.cl", clave: "secreto1" }])
  );
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: "ana@correo.cl" }));
}

describe("Navbar - enlaces", () => {
  it.each([
    ["Inicio", "/"],
    ["Vehículos", "/vehiculos"],
    ["Acerca de nosotros", "/nosotros"],
    ["Contacto", "/contacto"],
  ])("el enlace '%s' apunta a %s", (texto, ruta) => {
    renderConApp(<Navbar />);
    expect(screen.getByRole("link", { name: texto })).toHaveAttribute("href", ruta);
  });

  it("el logo lleva al inicio", () => {
    renderConApp(<Navbar />);
    expect(screen.getByRole("link", { name: "Logo AutoFacil" })).toHaveAttribute("href", "/");
  });

  it.each([
    ["/", "Inicio"],
    ["/vehiculos", "Vehículos"],
    ["/nosotros", "Acerca de nosotros"],
    ["/contacto", "Contacto"],
  ])("en %s solo el enlace '%s' queda activo", (ruta, activo) => {
    renderConApp(<Navbar />, { ruta });
    const activos = screen
      .getAllByRole("link")
      .filter((a) => a.classList.contains("active"))
      .map((a) => a.textContent);
    expect(activos).toEqual([activo]);
  });
});

describe("Navbar - sesión", () => {
  it("sin sesión ofrece iniciar sesión y no muestra cerrar sesión", () => {
    renderConApp(<Navbar />);
    expect(screen.getByRole("button", { name: /Iniciar sesión/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
  });

  it("con un usuario normal muestra su nombre sin la insignia de administrador", () => {
    iniciarComoUsuario();
    renderConApp(<Navbar />);
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar sesión" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Iniciar sesión/ })).not.toBeInTheDocument();
  });

  it("el botón de iniciar sesión abre el modal y cierra el menú móvil", async () => {
    const user = userEvent.setup();
    const { container } = renderConApp(<Navbar />);
    const menu = container.querySelector(".navbar-collapse");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(menu).toHaveClass("show");
    await user.click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    expect(menu).not.toHaveClass("show");
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("cerrar sesión también cierra el menú móvil", async () => {
    iniciarComoUsuario();
    const user = userEvent.setup();
    const { container } = renderConApp(<Navbar />);
    const menu = container.querySelector(".navbar-collapse");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(menu).toHaveClass("show");
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(menu).not.toHaveClass("show");
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });
});

describe("Navbar - tema", () => {
  it("el título del botón y su texto cambian al alternar el tema", async () => {
    const user = userEvent.setup();
    renderConApp(<Navbar />);
    const boton = screen.getByRole("button", { name: /modo claro y oscuro/i });
    expect(boton).toHaveAttribute("title", "Cambiar a modo oscuro");
    expect(boton).toHaveTextContent("Oscuro");

    await user.click(boton);
    expect(boton).toHaveAttribute("title", "Cambiar a modo claro");
    expect(boton).toHaveTextContent("Claro");

    await user.click(boton);
    expect(boton).toHaveAttribute("title", "Cambiar a modo oscuro");
    expect(document.documentElement).toHaveAttribute("data-bs-theme", "light");
  });
});
