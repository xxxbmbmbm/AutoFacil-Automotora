import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "./Navbar.jsx";
import { renderConApp, iniciarComoAdmin } from "../test/utils.jsx";
import { ADMIN } from "../datos/admin.js";

describe("Navbar", () => {
  it("muestra los enlaces y marca el activo", () => {
    renderConApp(<Navbar />, { ruta: "/vehiculos" });
    expect(screen.getByRole("link", { name: "Vehículos" })).toHaveClass("active");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveClass("active");
    expect(screen.getByRole("link", { name: "Contacto" })).toBeInTheDocument();
  });

  it("abre y cierra el menú móvil", async () => {
    const user = userEvent.setup();
    const { container } = renderConApp(<Navbar />);
    const menu = container.querySelector(".navbar-collapse");
    expect(menu).not.toHaveClass("show");
    await user.click(screen.getByRole("button", { name: "Abrir menú" }));
    expect(menu).toHaveClass("show");
    await user.click(screen.getByRole("link", { name: "Contacto" }));
    expect(menu).not.toHaveClass("show");
  });

  it("alterna el modo claro/oscuro", async () => {
    const user = userEvent.setup();
    renderConApp(<Navbar />);
    const boton = screen.getByRole("button", { name: /modo claro y oscuro/i });
    expect(boton).toHaveTextContent("Oscuro");
    await user.click(boton);
    expect(boton).toHaveTextContent("Claro");
    expect(document.documentElement).toHaveAttribute("data-tema", "oscuro");
  });

  it("muestra el usuario administrador y permite cerrar sesión", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Navbar />);
    expect(screen.getByText(new RegExp(ADMIN.nombre))).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(screen.getByRole("button", { name: /Iniciar sesión/ })).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });
});
