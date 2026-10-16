import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import { renderConApp } from "./test/utils.jsx";

describe("App - rutas", () => {
  it.each([
    ["/", /próximo auto/],
    ["/vehiculos", "Nuestros vehículos"],
    ["/nosotros", "Acerca de AutoFacil"],
    ["/contacto", "Contacto"],
    ["/comprar", "Confirma tu compra"],
    ["/ruta-que-no-existe", /próximo auto/],
  ])("la ruta %s muestra la página correcta", (ruta, titulo) => {
    renderConApp(<App />, { ruta });
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(titulo);
  });

  it("muestra la barra de navegación y el pie de página en todas las rutas", () => {
    for (const ruta of ["/", "/vehiculos", "/nosotros", "/contacto", "/comprar"]) {
      const { container, unmount } = renderConApp(<App />, { ruta });
      expect(screen.getByRole("navigation")).toBeInTheDocument();
      expect(container.querySelector("footer")).toBeInTheDocument();
      unmount();
    }
  });
});

describe("App - título del documento", () => {
  it.each([
    ["/", "AutoFacil | Automotora"],
    ["/vehiculos", "Vehículos | AutoFacil"],
    ["/nosotros", "Acerca de nosotros | AutoFacil"],
    ["/contacto", "Contacto | AutoFacil"],
    ["/comprar", "Comprar | AutoFacil"],
    ["/ruta-que-no-existe", "AutoFacil | Automotora"],
  ])("en %s el título es '%s'", (ruta, titulo) => {
    renderConApp(<App />, { ruta });
    expect(document.title).toBe(titulo);
  });

  it("se actualiza al navegar con el menú", async () => {
    const user = userEvent.setup();
    renderConApp(<App />);
    await user.click(screen.getByRole("link", { name: "Contacto" }));
    expect(document.title).toBe("Contacto | AutoFacil");
    await user.click(screen.getByRole("link", { name: "Acerca de nosotros" }));
    expect(document.title).toBe("Acerca de nosotros | AutoFacil");
  });
});

describe("App - navegación", () => {
  it("vuelve arriba de la página en cada cambio de ruta", async () => {
    const user = userEvent.setup();
    renderConApp(<App />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    window.scrollTo.mockClear();
    await user.click(screen.getByRole("link", { name: "Vehículos" }));
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
  });

  it("el logo lleva de vuelta al inicio", async () => {
    const user = userEvent.setup();
    renderConApp(<App />, { ruta: "/nosotros" });
    await user.click(screen.getByRole("link", { name: "Logo AutoFacil" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/próximo auto/);
  });

  it("los botones de la portada llevan al catálogo y a contacto", async () => {
    const user = userEvent.setup();
    renderConApp(<App />);
    await user.click(screen.getByRole("link", { name: "Ver vehículos" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Nuestros vehículos");
    await user.click(screen.getByRole("link", { name: "Inicio" }));
    await user.click(screen.getByRole("link", { name: "Contáctanos" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contacto");
  });
});
