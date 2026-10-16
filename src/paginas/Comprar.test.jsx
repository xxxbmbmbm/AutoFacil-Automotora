import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Routes, Route } from "react-router-dom";
import Comprar from "./Comprar.jsx";
import { renderConApp } from "../test/utils.jsx";
import { listaDeVehiculos } from "../datos/vehiculos.js";

const vehiculo = listaDeVehiculos[0];

function montar(ruta) {
  return renderConApp(
    <Routes>
      <Route path="/comprar" element={<Comprar />} />
      <Route path="/vehiculos" element={<h1>Destino: catálogo</h1>} />
    </Routes>,
    { ruta }
  );
}

const datosValidos = {
  "Calle y número": "Av. Providencia 1234",
  Comuna: "Providencia",
  Ciudad: "Santiago",
  "Nombre en la tarjeta": "Ana Perez",
  "Número de tarjeta": "4111111111111111",
  Vencimiento: "12/30",
  CVV: "123",
};

// Un valor "" deja el campo sin completar.
async function llenar(user, cambios = {}) {
  for (const [etiqueta, valor] of Object.entries({ ...datosValidos, ...cambios })) {
    if (valor === "") continue;
    const campo = etiqueta === "Vencimiento" ? screen.getByLabelText(/Vencimiento/) : screen.getByLabelText(etiqueta);
    await user.type(campo, valor);
  }
}

const confirmar = (user) => user.click(screen.getByRole("button", { name: "Confirmar pago" }));

describe("Comprar - resumen del vehículo", () => {
  it("muestra el encabezado de la página", () => {
    montar(`/comprar?id=${vehiculo.id}`);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Confirma tu compra");
    expect(screen.getByText(/no se procesa ningún pago real/)).toBeInTheDocument();
  });

  it("muestra los datos del vehículo elegido", () => {
    montar(`/comprar?id=${vehiculo.id}`);
    expect(screen.getByRole("heading", { name: "Estás comprando" })).toBeInTheDocument();
    expect(screen.getByAltText("Foto de Toyota Yaris")).toHaveAttribute("src", vehiculo.imagen);
    expect(screen.getByText("Toyota Yaris 2021")).toBeInTheDocument();
    expect(screen.getByText(/32\.000 km/)).toBeInTheDocument();
    expect(screen.getByText(/Automática/)).toBeInTheDocument();
    expect(screen.getByText("$8.990.000")).toBeInTheDocument();
  });

  it("muestra otro vehículo según el id de la URL", () => {
    const otro = listaDeVehiculos.find((v) => v.marca === "Ford");
    montar(`/comprar?id=${otro.id}`);
    expect(screen.getByText(`${otro.marca} ${otro.modelo} ${otro.anio}`)).toBeInTheDocument();
    expect(screen.getByText("$16.500.000")).toBeInTheDocument();
  });

  it.each([
    ["no hay id en la URL", "/comprar"],
    ["el id no existe", "/comprar?id=9999"],
    ["el id no es un número", "/comprar?id=abc"],
  ])("avisa y oculta el formulario cuando %s", (_descripcion, ruta) => {
    montar(ruta);
    expect(screen.getByText("No encontramos el vehículo seleccionado.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toHaveAttribute("href", "/vehiculos");
    expect(screen.queryByRole("button", { name: "Confirmar pago" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Datos de la tarjeta" })).not.toBeInTheDocument();
  });
});

describe("Comprar - formulario", () => {
  it("muestra las secciones de entrega y de tarjeta", () => {
    montar(`/comprar?id=${vehiculo.id}`);
    expect(screen.getByRole("heading", { name: "Dirección de entrega" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Datos de la tarjeta" })).toBeInTheDocument();
  });

  it("limita el número de tarjeta a 19 caracteres", async () => {
    const user = userEvent.setup();
    montar(`/comprar?id=${vehiculo.id}`);
    await user.type(screen.getByLabelText("Número de tarjeta"), "12345678901234567890123");
    expect(screen.getByLabelText("Número de tarjeta")).toHaveValue("1234567890123456789");
  });

  it("no marca la validación hasta intentar confirmar", () => {
    const { container } = montar(`/comprar?id=${vehiculo.id}`);
    expect(container.querySelector("form")).not.toHaveClass("was-validated");
  });

  it("al confirmar sin datos marca la validación y no avanza", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = montar(`/comprar?id=${vehiculo.id}`);
    await confirmar(user);
    expect(container.querySelector("form")).toHaveClass("was-validated");
    expect(alerta).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Confirma tu compra");
  });

  it.each([
    ["falta el nombre de la tarjeta", { "Nombre en la tarjeta": "" }],
    ["el número de tarjeta es muy corto", { "Número de tarjeta": "1234" }],
    ["el número de tarjeta tiene letras", { "Número de tarjeta": "abcdefghijklmn" }],
    ["el mes de vencimiento es 13", { Vencimiento: "13/30" }],
    ["el vencimiento no tiene el formato MM/AA", { Vencimiento: "1230" }],
    ["el CVV es muy corto", { CVV: "12" }],
    ["el CVV tiene letras", { CVV: "abc" }],
  ])("no confirma si %s", async (_descripcion, cambios) => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    montar(`/comprar?id=${vehiculo.id}`);
    await llenar(user, cambios);
    await confirmar(user);
    expect(alerta).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Confirma tu compra");
  });
});

describe("Comprar - compra exitosa", () => {
  it("confirma, nombra el vehículo y vuelve al catálogo", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    montar(`/comprar?id=${vehiculo.id}`);
    await llenar(user);
    await confirmar(user);
    expect(alerta).toHaveBeenCalledTimes(1);
    expect(alerta).toHaveBeenCalledWith("¡Compra exitosa! Gracias por comprar tu Toyota Yaris.");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Destino: catálogo");
  });

  it("acepta un número de tarjeta con espacios y un CVV de 4 dígitos", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    montar(`/comprar?id=${vehiculo.id}`);
    await llenar(user, { "Número de tarjeta": "4111 1111 1111 1111", CVV: "1234" });
    await confirmar(user);
    expect(alerta).toHaveBeenCalledTimes(1);
  });
});
