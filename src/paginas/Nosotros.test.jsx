import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import Nosotros from "./Nosotros.jsx";
import { renderConApp } from "../test/utils.jsx";

describe("Nosotros", () => {
  it("muestra el encabezado de la página", () => {
    renderConApp(<Nosotros />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Acerca de AutoFacil");
    expect(screen.getByText("Nuestra historia")).toBeInTheDocument();
    expect(screen.getByText(/Somos una automotora pensada/)).toBeInTheDocument();
  });

  it("cuenta cómo nació AutoFacil", () => {
    renderConApp(<Nosotros />);
    expect(screen.getByRole("heading", { level: 2, name: /mala experiencia comprando un auto/ })).toBeInTheDocument();
    expect(screen.getByText(/un grupo de amigos/)).toBeInTheDocument();
  });

  it("muestra los cuatro hitos de la línea de tiempo en orden", () => {
    const { container } = renderConApp(<Nosotros />);
    const hitos = [...container.querySelectorAll(".hito-tiempo h6")].map((h) => h.textContent);
    expect(hitos).toEqual(["Los inicios", "Crecimiento del catálogo", "Una plataforma propia", "Hoy"]);
  });

  it("solo el último hito no deja margen inferior", () => {
    const { container } = renderConApp(<Nosotros />);
    const items = container.querySelectorAll(".hito-tiempo");
    expect(items).toHaveLength(4);
    expect(items[0]).not.toHaveClass("mb-0");
    expect(items[2]).not.toHaveClass("mb-0");
    expect(items[3]).toHaveClass("mb-0");
  });

  it("muestra la misión y los valores", () => {
    renderConApp(<Nosotros />);
    for (const titulo of ["Misión", "Transparencia", "Cercanía"]) {
      expect(screen.getByRole("heading", { level: 5, name: titulo })).toBeInTheDocument();
    }
    expect(screen.getByText(/Simplificar la compra y venta de vehículos/)).toBeInTheDocument();
  });

  it("invita a ver los vehículos o a contactar", () => {
    renderConApp(<Nosotros />);
    expect(screen.getByRole("heading", { name: "¿Quieres conocer nuestro catálogo?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver vehículos" })).toHaveAttribute("href", "/vehiculos");
    expect(screen.getByRole("link", { name: "Contáctanos" })).toHaveAttribute("href", "/contacto");
  });
});
