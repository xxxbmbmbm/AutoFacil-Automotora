import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderConApp, iniciarComoCliente } from "../test/utils.jsx";
import { datosApiFalsa } from "../test/apiFalsa.js";

async function llenarCompra(user, tarjeta = "4111 1111 1111 1111") {
  await user.type(screen.getByLabelText("Calle y número"), "Av. Providencia 1234");
  await user.type(screen.getByLabelText("Comuna"), "Providencia");
  await user.type(screen.getByLabelText("Ciudad"), "Santiago");
  await user.type(screen.getByLabelText("Nombre en la tarjeta"), "Cliente Prueba");
  await user.type(screen.getByLabelText("Número de tarjeta"), tarjeta);
  await user.type(screen.getByLabelText(/Vencimiento/), "12/30");
  await user.type(screen.getByLabelText("CVV"), "123");
}

describe("Comprar", () => {
  it("sin sesión pide iniciar sesión antes de mostrar el pago", async () => {
    const user = userEvent.setup();
    renderConApp(<App />, { ruta: "/comprar?id=1" });
    expect(await screen.findByText("Toyota Yaris 2021")).toBeInTheDocument();
    expect(screen.queryByLabelText("Calle y número")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Iniciar sesión o crear cuenta" }));
    expect(screen.getByRole("heading", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("el cliente compra: se crea la boleta y el vehículo sale de la tienda", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    iniciarComoCliente();
    renderConApp(<App />, { ruta: "/comprar?id=1" });
    await screen.findByText("Toyota Yaris 2021");

    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(alerta).not.toHaveBeenCalled(); // formulario incompleto

    await llenarCompra(user, "4111");
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(alerta).not.toHaveBeenCalled(); // tarjeta muy corta

    await user.clear(screen.getByLabelText("Número de tarjeta"));
    await user.type(screen.getByLabelText("Número de tarjeta"), "4111 1111 1111 1111");
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));

    expect(await screen.findByRole("heading", { level: 1, name: "Nuestros vehículos" })).toBeInTheDocument();
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Compra exitosa (boleta N°"));
    expect(await screen.findByText(/vehículos encontrados/)).toHaveTextContent("11 vehículos encontrados");
    // El backend recibe la dirección, pero nunca los datos de la tarjeta
    const cuerpo = datosApiFalsa().boletas[0];
    expect(cuerpo).toMatchObject({ comuna: "Providencia", total: 8990000 });
    expect(JSON.stringify(fetch.mock.calls)).not.toContain("4111");
  });

  it("muestra el error si el vehículo ya se vendió mientras pagaba", async () => {
    const user = userEvent.setup();
    iniciarComoCliente();
    renderConApp(<App />, { ruta: "/comprar?id=1" });
    await screen.findByText("Toyota Yaris 2021");
    datosApiFalsa().vehiculos.find((v) => v.id === 1).estado = "VENDIDO";
    await llenarCompra(user);
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("El vehículo ya no está disponible.");
  });

  it("avisa si el vehículo no existe", async () => {
    renderConApp(<App />, { ruta: "/comprar?id=999" });
    expect(await screen.findByText("No encontramos el vehículo seleccionado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toHaveAttribute("href", "/vehiculos");
  });
});
