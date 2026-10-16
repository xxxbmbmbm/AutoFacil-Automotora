import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderConApp, iniciarComoAdmin } from "../test/utils.jsx";
import { listaDeVehiculos } from "../datos/vehiculos.js";

describe("Flujos completos de la aplicación", () => {
  it("el administrador agrega un vehículo y aparece primero en la portada", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<App />, { ruta: "/vehiculos" });

    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca", { selector: "input" }), "Zeekr");
    await user.type(screen.getByLabelText("Modelo"), "001");
    await user.type(screen.getByLabelText("Tipo"), "Eléctrico");
    await user.type(screen.getByLabelText("Precio (CLP)"), "30000000");
    await user.type(screen.getByLabelText("Kilometraje"), "0");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

    await user.click(screen.getByRole("link", { name: "Inicio" }));
    const fotos = screen.getAllByAltText(/^Foto de /);
    expect(fotos).toHaveLength(6);
    expect(fotos[0]).toHaveAttribute("alt", "Foto de Zeekr 001");
  });

  it("un visitante recorre el catálogo, elige un vehículo y completa la compra", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderConApp(<App />);

    await user.click(screen.getByRole("link", { name: "Vehículos" }));
    expect(screen.queryByRole("button", { name: /Eliminar/ })).not.toBeInTheDocument();

    await user.click(screen.getAllByRole("link", { name: /Comprar/ })[0]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Confirma tu compra");
    expect(screen.getByText(`${listaDeVehiculos[0].marca} ${listaDeVehiculos[0].modelo} ${listaDeVehiculos[0].anio}`)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Calle y número"), "Av. Providencia 1234");
    await user.type(screen.getByLabelText("Comuna"), "Providencia");
    await user.type(screen.getByLabelText("Ciudad"), "Santiago");
    await user.type(screen.getByLabelText("Nombre en la tarjeta"), "Ana Perez");
    await user.type(screen.getByLabelText("Número de tarjeta"), "4111111111111111");
    await user.type(screen.getByLabelText(/Vencimiento/), "12/30");
    await user.type(screen.getByLabelText("CVV"), "123");
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));

    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Compra exitosa"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
  });

  it("el modo oscuro elegido se mantiene al cambiar de página", async () => {
    const user = userEvent.setup();
    renderConApp(<App />);
    await user.click(screen.getByRole("button", { name: /modo claro y oscuro/i }));
    await user.click(screen.getByRole("link", { name: "Acerca de nosotros" }));
    expect(document.documentElement).toHaveAttribute("data-tema", "oscuro");
    expect(screen.getByRole("button", { name: /modo claro y oscuro/i })).toHaveTextContent("Claro");
  });
});
