import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

async function arrancar() {
  await act(async () => {
    await import("./main.jsx");
  });
}

describe("main.jsx (punto de entrada)", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    document.body.innerHTML = "";
    window.history.pushState({}, "", "/");
  });

  it("monta la aplicación dentro de #root", async () => {
    await arrancar();
    const root = document.getElementById("root");
    expect(root.querySelector("nav")).not.toBeNull();
    expect(root.querySelector("footer")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/próximo auto/);
  });

  it("usa la ruta actual del navegador (BrowserRouter)", async () => {
    window.history.pushState({}, "", "/nosotros");
    await arrancar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Acerca de AutoFacil");
    expect(document.title).toBe("Acerca de nosotros | AutoFacil");
  });

  it("incluye los proveedores de tema, sesión y catálogo", async () => {
    window.history.pushState({}, "", "/vehiculos");
    await arrancar();
    // Catálogo: lista los vehículos.
    expect(screen.getByText(/vehículos encontrados/)).toHaveTextContent("12 vehículos encontrados");
    // Tema: aplica el modo claro al documento.
    expect(document.documentElement).toHaveAttribute("data-tema", "claro");
    // Sesión: el botón del menú abre el modal.
    await userEvent.setup().click(screen.getByRole("button", { name: /Iniciar sesión/ }));
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
  });

  it("falla si no existe el elemento #root en la página", async () => {
    document.body.innerHTML = "";
    await expect(import("./main.jsx")).rejects.toThrow();
  });
});
