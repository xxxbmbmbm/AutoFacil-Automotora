import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import Vehiculos from "./Vehiculos.jsx";
import { renderConApp, iniciarComoAdmin } from "../test/utils.jsx";
import { listaDeVehiculos, listaDeMarcas } from "../datos/vehiculos.js";

const cuenta = () => screen.getByText(/vehículos encontrados/).textContent;
const selectorMarca = () => screen.getByLabelText("Marca", { selector: "select" });

describe("Navegación por marcas desde el inicio", () => {
  it("cada marca del inicio es un enlace al catálogo filtrado", () => {
    renderConApp(<App />, { ruta: "/" });
    for (const marca of listaDeMarcas) {
      const enlace = screen.getByRole("link", { name: `Ver vehículos ${marca}` });
      expect(enlace).toHaveAttribute("href", `/vehiculos?marca=${encodeURIComponent(marca)}`);
    }
  });
});

describe("Filtro por marca en el catálogo", () => {
  it("el selector lista todas las marcas con la opción 'Todas'", () => {
    renderConApp(<Vehiculos />);
    expect(screen.getByRole("option", { name: "Todas las marcas" })).toBeInTheDocument();
    for (const marca of listaDeMarcas) {
      expect(screen.getByRole("option", { name: marca })).toBeInTheDocument();
    }
  });

  it("muestra el aviso 'Mostrando solo' únicamente cuando hay una marca elegida", async () => {
    const user = userEvent.setup();
    const marca = listaDeVehiculos[0].marca;
    renderConApp(<Vehiculos />);
    expect(screen.queryByText(/Mostrando solo/)).not.toBeInTheDocument();
    await user.selectOptions(selectorMarca(), marca);
    expect(screen.getByText(/Mostrando solo/)).toHaveTextContent(marca);
  });

  it("una marca desconocida en la URL no encuentra vehículos y sugiere limpiar filtros", () => {
    renderConApp(<Vehiculos />, { ruta: "/vehiculos?marca=Inexistente" });
    expect(cuenta()).toBe("0 vehículos encontrados");
    expect(screen.getByText(/cambiando o limpiando los filtros/)).toBeInTheDocument();
  });

  it("combina la marca con el tipo de vehículo", async () => {
    const user = userEvent.setup();
    const { marca, tipo } = listaDeVehiculos[0];
    const esperados = listaDeVehiculos.filter((v) => v.marca === marca && v.tipo === tipo).length;
    renderConApp(<Vehiculos />, { ruta: `/vehiculos?marca=${marca}` });
    await user.selectOptions(screen.getByLabelText("Tipo de vehículo"), tipo);
    expect(cuenta()).toBe(`${esperados} vehículos encontrados`);
  });

  it("una marca nueva agregada por el administrador aparece en el selector y se puede filtrar", async () => {
    iniciarComoAdmin();
    const user = userEvent.setup();
    renderConApp(<Vehiculos />);
    await user.click(screen.getByRole("button", { name: /Agregar vehículo/ }));
    await user.type(screen.getByLabelText("Marca", { selector: "input" }), "Zeekr");
    await user.type(screen.getByLabelText("Modelo"), "001");
    await user.type(screen.getByLabelText("Tipo"), "Eléctrico");
    await user.type(screen.getByLabelText("Precio (CLP)"), "30000000");
    await user.type(screen.getByLabelText("Kilometraje"), "0");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

    expect(screen.getByRole("option", { name: "Zeekr" })).toBeInTheDocument();
    await user.selectOptions(selectorMarca(), "Zeekr");
    expect(cuenta()).toBe("1 vehículos encontrados");
  });
});

describe("Compra con dirección de entrega", () => {
  const id = listaDeVehiculos[0].id;

  async function llenar(user, omitir) {
    const campos = {
      "Calle y número": "Av. Providencia 1234",
      Comuna: "Providencia",
      Ciudad: "Santiago",
      "Nombre en la tarjeta": "Ana Perez",
      "Número de tarjeta": "4111111111111111",
      CVV: "123",
    };
    for (const [etiqueta, valor] of Object.entries(campos)) {
      if (etiqueta !== omitir) await user.type(screen.getByLabelText(etiqueta), valor);
    }
    if (omitir !== "Vencimiento") await user.type(screen.getByLabelText(/Vencimiento/), "12/30");
  }

  it("muestra la sección de dirección además de la tarjeta", () => {
    renderConApp(<App />, { ruta: `/comprar?id=${id}` });
    expect(screen.getByRole("heading", { name: "Dirección de entrega" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Datos de la tarjeta" })).toBeInTheDocument();
  });

  it.each(["Calle y número", "Comuna", "Ciudad"])(
    "no confirma la compra si falta el campo obligatorio: %s",
    async (campo) => {
      const user = userEvent.setup();
      const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
      renderConApp(<App />, { ruta: `/comprar?id=${id}` });
      await llenar(user, campo);
      await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
      expect(alerta).not.toHaveBeenCalled();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Confirma tu compra");
    }
  );

  it("con todos los datos confirma, nombra el vehículo y vuelve al catálogo", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderConApp(<App />, { ruta: `/comprar?id=${id}` });
    await llenar(user);
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining(listaDeVehiculos[0].modelo));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
  });
});
