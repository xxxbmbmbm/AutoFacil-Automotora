import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderConApp } from "../test/utils.jsx";
import { listaDeVehiculos, listaDeMarcas } from "../datos/vehiculos.js";

describe("Rutas de la aplicación", () => {
  it("Inicio muestra el hero, 6 vehículos y las marcas", () => {
    renderConApp(<App />, { ruta: "/" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/próximo auto/);
    expect(screen.getAllByText(listaDeMarcas[0]).length).toBeGreaterThan(0);
    expect(document.title).toBe("AutoFacil | Automotora");
  });

  it("al tocar una marca del inicio se abre el catálogo filtrado por esa marca", async () => {
    const user = userEvent.setup();
    const marca = listaDeMarcas[0];
    const esperados = listaDeVehiculos.filter((v) => v.marca === marca).length;
    renderConApp(<App />, { ruta: "/" });
    await user.click(screen.getByRole("link", { name: `Ver vehículos ${marca}` }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
    expect(screen.getByText(/vehículos encontrados/).textContent).toBe(`${esperados} vehículos encontrados`);
  });

  it("Nosotros y Vehículos actualizan el título", () => {
    renderConApp(<App />, { ruta: "/nosotros" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Acerca de AutoFacil");
    expect(document.title).toBe("Acerca de nosotros | AutoFacil");
  });

  it("una ruta desconocida vuelve al inicio", () => {
    renderConApp(<App />, { ruta: "/no-existe" });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/próximo auto/);
  });

  it("navega entre páginas desde el menú", async () => {
    const user = userEvent.setup();
    renderConApp(<App />);
    await user.click(screen.getByRole("link", { name: "Vehículos" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
    expect(window.scrollTo).toHaveBeenCalled();
  });
});

describe("Contacto", () => {
  it("valida y envía el formulario", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    renderConApp(<App />, { ruta: "/contacto" });
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));
    expect(alerta).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Nombre completo"), "Ana");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.selectOptions(screen.getByLabelText("Asunto"), "Otro");
    await user.type(screen.getByLabelText("Mensaje"), "Hola, necesito ayuda con un auto");
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Ana"));
  });
});

describe("Comprar", () => {
  it("muestra aviso si el vehículo no existe", () => {
    renderConApp(<App />, { ruta: "/comprar?id=9999" });
    expect(screen.getByText(/No encontramos el vehículo/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al catálogo" })).toBeInTheDocument();
  });

  it("muestra el vehículo y completa la compra", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    const v = listaDeVehiculos[0];
    renderConApp(<App />, { ruta: `/comprar?id=${v.id}` });
    expect(screen.getByText(new RegExp(`${v.marca} ${v.modelo}`))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(alerta).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Nombre en la tarjeta"), "Ana Perez");
    await user.type(screen.getByLabelText("Número de tarjeta"), "4111111111111111");
    await user.type(screen.getByLabelText(/Vencimiento/), "12/30");
    await user.type(screen.getByLabelText("CVV"), "123");
    await user.click(screen.getByRole("button", { name: "Confirmar pago" }));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Compra exitosa"));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
  });
});
