import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import Inicio from "./Inicio.jsx";
import { renderConApp } from "../test/utils.jsx";
import { CLAVE_VEHICULOS } from "../contexto/VehiculosContext.jsx";
import { listaDeVehiculos, listaDeMarcas, formatearPrecioClp } from "../datos/vehiculos.js";

const fotos = () => screen.queryAllByAltText(/^Foto de /);

function vehiculoDePrueba(id, marca, modelo, precio) {
  return {
    id, marca, modelo, anio: 2024, tipo: "Sedán", precio, precioAnterior: null,
    kilometraje: "1.000 km", transmision: "Manual", imagen: "/images/logo.png", colorFondo: "#000000",
  };
}

describe("Inicio - portada", () => {
  it("muestra el título principal y la etiqueta de la automotora", () => {
    renderConApp(<Inicio />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Encuentra tu próximo auto de forma fácil");
    expect(screen.getByText("Automotora de confianza")).toBeInTheDocument();
  });

  it("ofrece los botones para ver vehículos y contactar", () => {
    renderConApp(<Inicio />);
    expect(screen.getByRole("link", { name: "Ver vehículos" })).toHaveAttribute("href", "/vehiculos");
    expect(screen.getByRole("link", { name: "Contáctanos" })).toHaveAttribute("href", "/contacto");
  });
});

describe("Inicio - vitrina de vehículos", () => {
  it("muestra solo los 6 primeros vehículos del catálogo", () => {
    renderConApp(<Inicio />);
    expect(fotos()).toHaveLength(6);
    for (const v of listaDeVehiculos.slice(0, 6)) {
      expect(screen.getByAltText(`Foto de ${v.marca} ${v.modelo}`)).toHaveAttribute("src", v.imagen);
      expect(screen.getByText(formatearPrecioClp(v.precio))).toBeInTheDocument();
    }
    const septimo = listaDeVehiculos[6];
    expect(screen.queryByAltText(`Foto de ${septimo.marca} ${septimo.modelo}`)).not.toBeInTheDocument();
  });

  it("cada tarjeta enlaza al catálogo", () => {
    renderConApp(<Inicio />);
    const enlace = screen.getByAltText("Foto de Toyota Yaris").closest("a");
    expect(enlace).toHaveAttribute("href", "/vehiculos");
  });

  it("tiene un enlace al catálogo completo", () => {
    renderConApp(<Inicio />);
    expect(screen.getByRole("link", { name: /Ver catálogo completo/ })).toHaveAttribute("href", "/vehiculos");
  });

  it("refleja el catálogo guardado por el administrador", () => {
    localStorage.setItem(
      CLAVE_VEHICULOS,
      JSON.stringify([vehiculoDePrueba(1, "Marca", "Uno", 1500000), vehiculoDePrueba(2, "Marca", "Dos", 2500000)])
    );
    renderConApp(<Inicio />);
    expect(fotos()).toHaveLength(2);
    expect(screen.getByAltText("Foto de Marca Uno")).toBeInTheDocument();
    expect(screen.getByText("$2.500.000")).toBeInTheDocument();
  });

  it("no rompe con un catálogo vacío", () => {
    localStorage.setItem(CLAVE_VEHICULOS, "[]");
    renderConApp(<Inicio />);
    expect(fotos()).toHaveLength(0);
    expect(screen.getByRole("heading", { name: "Algunos de nuestros vehículos" })).toBeInTheDocument();
  });
});

describe("Inicio - marcas, beneficios y cierre", () => {
  it("lista todas las marcas como enlaces al catálogo filtrado", () => {
    renderConApp(<Inicio />);
    const enlaces = screen.getAllByRole("link", { name: /^Ver vehículos .+/ });
    expect(enlaces).toHaveLength(listaDeMarcas.length);
    expect(screen.getByRole("link", { name: "Ver vehículos Volkswagen" })).toHaveAttribute(
      "href",
      "/vehiculos?marca=Volkswagen"
    );
  });

  it("muestra los tres beneficios", () => {
    renderConApp(<Inicio />);
    for (const titulo of ["Compra segura", "Precios claros", "Asesoría real"]) {
      expect(screen.getByRole("heading", { level: 5, name: titulo })).toBeInTheDocument();
    }
  });

  it("termina con una invitación a explorar el catálogo", () => {
    renderConApp(<Inicio />);
    expect(screen.getByRole("heading", { name: "¿Listo para encontrar tu próximo vehículo?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorar catálogo" })).toHaveAttribute("href", "/vehiculos");
  });
});
