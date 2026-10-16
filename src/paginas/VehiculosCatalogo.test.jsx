import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Vehiculos from "./Vehiculos.jsx";
import { renderConApp, iniciarComoAdmin } from "../test/utils.jsx";
import { listaDeVehiculos, formatearPrecioClp } from "../datos/vehiculos.js";

const total = listaDeVehiculos.length;
const cuenta = () => screen.getByText(/vehículos encontrados/).textContent;
const tiposUnicos = [...new Set(listaDeVehiculos.map((v) => v.tipo))];

describe("Vehiculos - encabezado y filtros", () => {
  it("muestra el encabezado del catálogo", () => {
    renderConApp(<Vehiculos />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
    expect(screen.getByText("Catálogo")).toBeInTheDocument();
  });

  it("el selector de tipo lista cada tipo del catálogo una sola vez", () => {
    renderConApp(<Vehiculos />);
    const opciones = within(screen.getByLabelText("Tipo de vehículo")).getAllByRole("option");
    expect(opciones.map((o) => o.textContent)).toEqual(["Todos los tipos", ...tiposUnicos]);
  });

  it("filtra por un rango de precio mínimo y máximo", async () => {
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.type(screen.getByLabelText("Precio mínimo (CLP)"), "8000000");
    await user.type(screen.getByLabelText("Precio máximo (CLP)"), "9000000");
    const esperados = listaDeVehiculos.filter((v) => v.precio >= 8000000 && v.precio <= 9000000).length;
    expect(esperados).toBeGreaterThan(0);
    expect(cuenta()).toBe(`${esperados} vehículos encontrados`);
  });

  it("combina el tipo con el rango de precio", async () => {
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.selectOptions(screen.getByLabelText("Tipo de vehículo"), "Sedán");
    await user.type(screen.getByLabelText("Precio mínimo (CLP)"), "9000000");
    const esperados = listaDeVehiculos.filter((v) => v.tipo === "Sedán" && v.precio >= 9000000).length;
    expect(cuenta()).toBe(`${esperados} vehículos encontrados`);
  });

  it("limpiar filtros restablece tipo y precios", async () => {
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.selectOptions(screen.getByLabelText("Tipo de vehículo"), "SUV");
    await user.type(screen.getByLabelText("Precio mínimo (CLP)"), "1000");
    await user.type(screen.getByLabelText("Precio máximo (CLP)"), "99999999");
    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(screen.getByLabelText("Tipo de vehículo")).toHaveValue("todos");
    expect(screen.getByLabelText("Precio mínimo (CLP)")).toHaveValue(null);
    expect(screen.getByLabelText("Precio máximo (CLP)")).toHaveValue(null);
    expect(cuenta()).toBe(`${total} vehículos encontrados`);
  });
});

describe("Vehiculos - tarjetas", () => {
  it("cada tarjeta enlaza a la compra de su vehículo", () => {
    renderConApp(<Vehiculos />);
    const enlaces = screen.getAllByRole("link", { name: /Comprar/ });
    expect(enlaces.map((a) => a.getAttribute("href"))).toEqual(
      listaDeVehiculos.map((v) => `/comprar?id=${v.id}`)
    );
  });

  it("muestra marca, modelo, año, kilometraje, transmisión, tipo y precio", () => {
    const { container } = renderConApp(<Vehiculos />);
    const v = listaDeVehiculos[0];
    expect(screen.getByText(`${v.marca} ${v.modelo} ${v.anio}`)).toBeInTheDocument();
    expect(screen.getByAltText(`Foto de ${v.marca} ${v.modelo}`)).toHaveAttribute("src", v.imagen);
    expect(screen.getByText(`${v.kilometraje} · ${v.transmision}`, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(formatearPrecioClp(v.precio))).toBeInTheDocument();
    expect(container.querySelectorAll(".insignia-tipo")).toHaveLength(total);
  });

  it("aplica el color de fondo de cada vehículo", () => {
    const { container } = renderConApp(<Vehiculos />);
    const cabecera = container.querySelector(".cabecera-vehiculo");
    expect(cabecera.style.backgroundColor).not.toBe("");
  });

  it("muestra el precio anterior tachado solo en las ofertas", () => {
    const { container } = renderConApp(<Vehiculos />);
    const ofertas = listaDeVehiculos.filter((v) => v.precioAnterior !== null);
    const anteriores = [...container.querySelectorAll(".precio-anterior")].map((e) => e.textContent);
    expect(anteriores).toEqual(ofertas.map((v) => formatearPrecioClp(v.precioAnterior)));
  });
});

describe("Vehiculos - administrador", () => {
  it("el formulario sugiere los tipos existentes del catálogo", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    const sugerencias = [...document.querySelectorAll("#lista-tipos option")].map((o) => o.getAttribute("value"));
    expect(sugerencias).toEqual(tiposUnicos);
  });

  it("al agregar un vehículo con oferta lo muestra con su insignia", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    const ofertasAntes = screen.queryAllByText("Oferta").length;
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca", { selector: "input" }), "Fiat");
    await user.type(screen.getByLabelText("Modelo"), "Mobi");
    await user.type(screen.getByLabelText("Tipo"), "Citycar");
    await user.type(screen.getByLabelText("Precio (CLP)"), "5000000");
    await user.type(screen.getByLabelText("Precio anterior (opcional)"), "6000000");
    await user.type(screen.getByLabelText("Kilometraje"), "20000");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

    expect(screen.getByText(/Fiat Mobi/)).toBeInTheDocument();
    expect(screen.queryAllByText("Oferta")).toHaveLength(ofertasAntes + 1);
    expect(screen.getByText("$6.000.000")).toBeInTheDocument();
  });

  it("el vehículo nuevo se agrega al inicio de la lista", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca", { selector: "input" }), "Fiat");
    await user.type(screen.getByLabelText("Modelo"), "Mobi");
    await user.type(screen.getByLabelText("Tipo"), "Citycar");
    await user.type(screen.getByLabelText("Precio (CLP)"), "5000000");
    await user.type(screen.getByLabelText("Kilometraje"), "20000");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

    const primero = screen.getAllByRole("link", { name: /Comprar/ })[0];
    expect(primero).toHaveAttribute("href", `/comprar?id=${total + 1}`);
  });
});
