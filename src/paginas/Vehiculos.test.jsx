import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderConApp, iniciarComoAdmin, iniciarComoVendedor } from "../test/utils.jsx";
import { apagarApiFalsa, datosApiFalsa } from "../test/apiFalsa.js";

const conteo = () => screen.findByText(/vehículos encontrados/);

describe("Catálogo de vehículos", () => {
  it("carga los vehículos del backend y los filtra por marca, tipo y precio", async () => {
    const user = userEvent.setup();
    renderConApp(<App />, { ruta: "/vehiculos?marca=Toyota" });
    expect(await conteo()).toHaveTextContent("2 vehículos encontrados");
    expect(screen.getAllByText("32.000 km · Automática").length).toBe(1);

    await user.click(screen.getByRole("button", { name: "Ver todas las marcas" }));
    expect(await conteo()).toHaveTextContent("12 vehículos encontrados");
    await user.selectOptions(screen.getByLabelText("Tipo de vehículo"), "SUV");
    expect(await conteo()).toHaveTextContent("3 vehículos encontrados");
    await user.type(screen.getByLabelText("Precio mínimo (CLP)"), "13000000");
    await user.type(screen.getByLabelText("Precio máximo (CLP)"), "14000000");
    expect(await conteo()).toHaveTextContent("1 vehículos encontrados");
    await user.selectOptions(screen.getByLabelText("Marca"), "Ford");
    expect(screen.getByText(/No encontramos vehículos/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(await conteo()).toHaveTextContent("12 vehículos encontrados");
  });

  it("muestra el error si el backend no responde", async () => {
    apagarApiFalsa();
    renderConApp(<App />, { ruta: "/vehiculos" });
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectar con el servidor");
  });

  it("el administrador agrega y elimina vehículos", async () => {
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/vehiculos" });
    await conteo();

    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    const guardar = () => user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    await guardar();
    expect(screen.getByLabelText("Marca", { selector: "#v-marca" })).toBeInvalid();

    await user.type(screen.getByLabelText("Marca", { selector: "#v-marca" }), "BYD");
    await user.type(screen.getByLabelText("Modelo"), "Dolphin");
    await user.selectOptions(screen.getByLabelText("Tipo"), "Hatchback");
    await user.type(screen.getByLabelText("Precio (CLP)"), "18000000");
    await user.type(screen.getByLabelText("Precio anterior (opcional)"), "19000000");
    await user.type(screen.getByLabelText("Kilometraje"), "0");
    await user.type(screen.getByLabelText("URL de la imagen"), "https://ejemplo.cl/byd.jpg");
    await guardar();

    expect(await conteo()).toHaveTextContent("13 vehículos encontrados");
    expect(screen.queryByRole("button", { name: "Guardar vehículo" })).not.toBeInTheDocument();
    const tarjeta = screen.getByText("BYD Dolphin", { exact: false }).closest(".tarjeta-vehiculo");
    expect(within(tarjeta).getByText("Oferta")).toBeInTheDocument();

    vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValue(true);
    await user.click(within(tarjeta).getByRole("button", { name: /Eliminar/ }));
    expect(screen.getByText("BYD Dolphin", { exact: false })).toBeInTheDocument();
    await user.click(within(tarjeta).getByRole("button", { name: /Eliminar/ }));
    expect(await conteo()).toHaveTextContent("12 vehículos encontrados");
  });

  it("muestra los errores del servidor al administrador", async () => {
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/vehiculos" });
    await conteo();
    datosApiFalsa().usuarios.find((u) => u.id === 1).rol = "VENDEDOR"; // el backend ya no lo deja

    vi.spyOn(window, "confirm").mockReturnValue(true);
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    await user.click(screen.getAllByRole("button", { name: /Eliminar/ })[0]);
    expect(alerta).toHaveBeenCalledWith("No tienes permisos para realizar esta acción.");

    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca", { selector: "#v-marca" }), "BYD");
    await user.type(screen.getByLabelText("Modelo"), "Seal");
    await user.selectOptions(screen.getByLabelText("Tipo"), "Sedán");
    await user.type(screen.getByLabelText("Precio (CLP)"), "30000000");
    await user.type(screen.getByLabelText("Kilometraje"), "0");
    await user.type(screen.getByLabelText("URL de la imagen"), "https://ejemplo.cl/seal.jpg");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    expect(await screen.findByText("No tienes permisos para realizar esta acción.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
  });

  it("el vendedor ve todo el catálogo (incluido lo vendido) pero no puede comprar ni editar", async () => {
    datosApiFalsa().vehiculos[0].estado = "VENDIDO";
    iniciarComoVendedor();
    renderConApp(<App />, { ruta: "/vehiculos" });
    expect(await conteo()).toHaveTextContent("12 vehículos encontrados");
    expect(screen.getByText("Vendido")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Comprar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Agregar vehículo/ })).not.toBeInTheDocument();
  });

  it("muestra la ficha de un vehículo y un error si no existe", async () => {
    renderConApp(<App />, { ruta: "/vehiculos/2" });
    expect(await screen.findByRole("heading", { level: 1, name: "Chevrolet Sail 2020" })).toBeInTheDocument();
    expect(screen.getByText("41.500 km")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comprar" })).toHaveAttribute("href", "/comprar?id=2");

    renderConApp(<App />, { ruta: "/vehiculos/999" });
    expect(await screen.findByText("No existe el vehículo con id 999.")).toBeInTheDocument();
  });
});
