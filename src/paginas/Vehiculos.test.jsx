import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Vehiculos from "./Vehiculos.jsx";
import { renderConApp, iniciarComoAdmin } from "../test/utils.jsx";
import { listaDeVehiculos } from "../datos/vehiculos.js";

const total = listaDeVehiculos.length;
const cuenta = () => screen.getByText(/vehículos encontrados/).textContent;

describe("Vehiculos (usuario normal)", () => {
  it("lista todo el catálogo sin controles de administrador", () => {
    renderConApp(<Vehiculos />);
    expect(cuenta()).toBe(`${total} vehículos encontrados`);
    expect(screen.queryByRole("button", { name: /Agregar vehículo/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();
  });

  it("filtra por tipo, por precio y limpia los filtros", async () => {
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    const tipo = listaDeVehiculos[0].tipo;
    const esperados = listaDeVehiculos.filter((v) => v.tipo === tipo).length;
    await user.selectOptions(screen.getByLabelText("Tipo de vehículo"), tipo);
    expect(cuenta()).toBe(`${esperados} vehículos encontrados`);

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(cuenta()).toBe(`${total} vehículos encontrados`);

    await user.type(screen.getByLabelText("Precio mínimo (CLP)"), "999999999");
    expect(cuenta()).toBe("0 vehículos encontrados");
    expect(screen.getByText(/No encontramos vehículos/)).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Precio mínimo (CLP)"));
    await user.type(screen.getByLabelText("Precio máximo (CLP)"), "1");
    expect(cuenta()).toBe("0 vehículos encontrados");
  });

  it("muestra la insignia de oferta y el precio anterior solo cuando corresponde", () => {
    renderConApp(<Vehiculos />);
    const ofertas = listaDeVehiculos.filter((v) => v.precioAnterior !== null).length;
    expect(screen.queryAllByText("Oferta")).toHaveLength(ofertas);
  });
});

describe("Vehiculos (administrador)", () => {
  it("muestra los controles de administración", () => {
    iniciarComoAdmin();
    renderConApp(<Vehiculos />);
    expect(screen.getByRole("button", { name: /Agregar vehículo/ })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Eliminar/ })).toHaveLength(total);
  });

  it("agrega un vehículo nuevo al catálogo", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca"), "Kia");
    await user.type(screen.getByLabelText("Modelo"), "Picanto");
    await user.type(screen.getByLabelText("Tipo"), "Citycar");
    await user.type(screen.getByLabelText("Precio (CLP)"), "7500000");
    await user.type(screen.getByLabelText("Kilometraje"), "12000");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

    expect(cuenta()).toBe(`${total + 1} vehículos encontrados`);
    expect(screen.getByText(/Kia Picanto/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Guardar vehículo" })).not.toBeInTheDocument();
  });

  it("abre y cierra el formulario con los botones", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    expect(screen.getByRole("button", { name: "Guardar vehículo" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerrar formulario" }));
    expect(screen.queryByRole("button", { name: "Guardar vehículo" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("button", { name: "Guardar vehículo" })).not.toBeInTheDocument();
  });

  it("elimina un vehículo solo si se confirma", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm");
    renderConApp(<Vehiculos />);

    confirmar.mockReturnValueOnce(false);
    await user.click(screen.getAllByRole("button", { name: /Eliminar/ })[0]);
    expect(cuenta()).toBe(`${total} vehículos encontrados`);

    confirmar.mockReturnValueOnce(true);
    await user.click(screen.getAllByRole("button", { name: /Eliminar/ })[0]);
    expect(cuenta()).toBe(`${total - 1} vehículos encontrados`);
  });

  it("restablece el catálogo original solo si se confirma", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    const confirmar = vi.spyOn(window, "confirm").mockReturnValue(true);
    renderConApp(<Vehiculos />);
    await user.click(screen.getAllByRole("button", { name: /Eliminar/ })[0]);
    expect(cuenta()).toBe(`${total - 1} vehículos encontrados`);

    confirmar.mockReturnValueOnce(false);
    await user.click(screen.getByRole("button", { name: /Restablecer catálogo/ }));
    expect(cuenta()).toBe(`${total - 1} vehículos encontrados`);

    await user.click(screen.getByRole("button", { name: /Restablecer catálogo/ }));
    expect(cuenta()).toBe(`${total} vehículos encontrados`);
    expect(within(document.body).getAllByRole("link", { name: /Comprar/ })).toHaveLength(total);
  });
});
