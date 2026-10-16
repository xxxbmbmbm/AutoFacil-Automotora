import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormularioVehiculo from "./FormularioVehiculo.jsx";

const montar = (props = {}) => {
  const onGuardar = vi.fn();
  const onCancelar = vi.fn();
  const resultado = render(
    <FormularioVehiculo tipos={[]} onGuardar={onGuardar} onCancelar={onCancelar} {...props} />
  );
  return { onGuardar, onCancelar, ...resultado };
};

// Un valor "" deja el campo sin completar.
async function llenar(user, cambios = {}) {
  const v = { Marca: "Kia", Modelo: "Rio", Tipo: "Sedán", "Precio (CLP)": "10000000", Kilometraje: "32000", ...cambios };
  for (const [etiqueta, valor] of Object.entries(v)) {
    if (valor !== "") await user.type(screen.getByLabelText(etiqueta), valor);
  }
}

const guardar = (user) => user.click(screen.getByRole("button", { name: "Guardar vehículo" }));

describe("FormularioVehiculo - valores iniciales", () => {
  it("parte con el año actual, transmisión automática y color oscuro", () => {
    montar();
    expect(screen.getByLabelText("Año")).toHaveValue(new Date().getFullYear());
    expect(screen.getByLabelText("Transmisión")).toHaveValue("Automática");
    expect(screen.getByLabelText("Color de fondo")).toHaveValue("#141416");
  });

  it("no está marcado como validado al abrir", () => {
    const { container } = montar();
    expect(container.querySelector("form")).not.toHaveClass("was-validated");
  });

  it("ofrece los tipos recibidos como sugerencias", () => {
    montar({ tipos: ["SUV", "Pickup"] });
    const valores = [...document.querySelectorAll("#lista-tipos option")].map((o) => o.getAttribute("value"));
    expect(valores).toEqual(["SUV", "Pickup"]);
  });

  it("ofrece las transmisiones Automática y Mecánica", () => {
    montar();
    expect(screen.getByRole("option", { name: "Automática" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Mecánica" })).toBeInTheDocument();
  });
});

describe("FormularioVehiculo - validación", () => {
  it.each([
    ["falta la marca", { Marca: "" }],
    ["falta el modelo", { Modelo: "" }],
    ["falta el tipo", { Tipo: "" }],
    ["falta el precio", { "Precio (CLP)": "" }],
    ["el precio es cero", { "Precio (CLP)": "0" }],
    ["falta el kilometraje", { Kilometraje: "" }],
    ["la URL de la imagen no es válida", { "URL de la imagen (opcional)": "no-es-una-url" }],
  ])("no guarda si %s", async (_descripcion, cambios) => {
    const user = userEvent.setup();
    const { onGuardar, container } = montar();
    await llenar(user, cambios);
    await guardar(user);
    expect(onGuardar).not.toHaveBeenCalled();
    expect(container.querySelector("form")).toHaveClass("was-validated");
  });

  it("no guarda si el año es anterior a 1980", async () => {
    const user = userEvent.setup();
    const { onGuardar } = montar();
    await llenar(user);
    await user.clear(screen.getByLabelText("Año"));
    await user.type(screen.getByLabelText("Año"), "1900");
    await guardar(user);
    expect(onGuardar).not.toHaveBeenCalled();
  });
});

describe("FormularioVehiculo - datos enviados", () => {
  it("convierte los números y da formato al kilometraje", async () => {
    const user = userEvent.setup();
    const { onGuardar } = montar();
    await llenar(user, { Kilometraje: "1500000" });
    await user.clear(screen.getByLabelText("Año"));
    await user.type(screen.getByLabelText("Año"), "2022");
    await guardar(user);
    expect(onGuardar).toHaveBeenCalledTimes(1);
    expect(onGuardar).toHaveBeenCalledWith({
      marca: "Kia",
      modelo: "Rio",
      anio: 2022,
      tipo: "Sedán",
      precio: 10000000,
      precioAnterior: null,
      kilometraje: "1.500.000 km",
      transmision: "Automática",
      imagen: "/images/logo.png",
      colorFondo: "#141416",
    });
  });

  it("envía el color de fondo elegido", async () => {
    const user = userEvent.setup();
    const { onGuardar } = montar();
    await llenar(user);
    fireEvent.change(screen.getByLabelText("Color de fondo"), { target: { value: "#ff0000" } });
    await guardar(user);
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ colorFondo: "#ff0000" }));
  });

  it("quita los espacios sobrantes de textos y URL", async () => {
    const user = userEvent.setup();
    const { onGuardar } = montar();
    await llenar(user, { Marca: "  Kia  ", Modelo: "  Rio ", Tipo: " Sedán  " });
    await user.type(screen.getByLabelText("URL de la imagen (opcional)"), "https://ejemplo.cl/a.jpg");
    await guardar(user);
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ marca: "Kia", modelo: "Rio", tipo: "Sedán", imagen: "https://ejemplo.cl/a.jpg" })
    );
  });

  it("descarta un precio anterior igual al precio", async () => {
    const user = userEvent.setup();
    const { onGuardar } = montar();
    await llenar(user, { "Precio anterior (opcional)": "10000000" });
    await guardar(user);
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ precioAnterior: null }));
  });

  it("no llama a onGuardar al cancelar", async () => {
    const user = userEvent.setup();
    const { onGuardar, onCancelar } = montar();
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
    expect(onGuardar).not.toHaveBeenCalled();
  });
});
