import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EncabezadoPagina from "./EncabezadoPagina.jsx";
import Footer from "./Footer.jsx";

describe("EncabezadoPagina", () => {
  it("muestra la etiqueta, el título principal y el subtítulo recibidos", () => {
    render(<EncabezadoPagina etiqueta="Catálogo" titulo="Mi título" subtitulo="Mi subtítulo" />);
    expect(screen.getByRole("heading", { level: 1, name: "Mi título" })).toBeInTheDocument();
    expect(screen.getByText("Catálogo")).toHaveClass("etiqueta-hero");
    expect(screen.getByText("Mi subtítulo")).toHaveClass("subtitulo-hero");
  });

  it("usa un <header> con la clase de encabezado de página", () => {
    const { container } = render(<EncabezadoPagina etiqueta="a" titulo="b" subtitulo="c" />);
    expect(container.querySelector("header")).toHaveClass("encabezado-pagina");
  });

  it("renderiza otros textos al cambiar las props", () => {
    const { rerender } = render(<EncabezadoPagina etiqueta="Uno" titulo="Título uno" subtitulo="Sub uno" />);
    rerender(<EncabezadoPagina etiqueta="Dos" titulo="Título dos" subtitulo="Sub dos" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Título dos");
    expect(screen.queryByText("Título uno")).not.toBeInTheDocument();
  });
});

describe("Footer", () => {
  it("muestra el logo con texto alternativo", () => {
    render(<Footer />);
    const logo = screen.getByAltText("Logo AutoFacil");
    expect(logo).toHaveAttribute("src", "/images/logo.png");
  });

  it("muestra la descripción de la automotora", () => {
    render(<Footer />);
    expect(screen.getByText(/Tu automotora de confianza/)).toBeInTheDocument();
  });

  it("muestra los datos de contacto", () => {
    render(<Footer />);
    expect(screen.getByRole("heading", { level: 6, name: "Contacto" })).toBeInTheDocument();
    expect(screen.getByText(/Av\. Principal 1234, Santiago/)).toBeInTheDocument();
    expect(screen.getByText(/\+56 9 1234 5678/)).toBeInTheDocument();
    expect(screen.getByText(/contacto@autofacil\.cl/)).toBeInTheDocument();
  });

  it("es un <footer> con la clase del pie de página", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toHaveClass("pie-pagina");
  });
});
