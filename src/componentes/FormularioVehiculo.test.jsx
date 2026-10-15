import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormularioVehiculo from "./FormularioVehiculo.jsx";

async function llenar(user, { precio = "10000000", anterior = "" } = {}) {
  await user.type(screen.getByLabelText("Marca"), " Kia ");
  await user.type(screen.getByLabelText("Modelo"), "Rio");
  await user.type(screen.getByLabelText("Tipo"), "Sedán");
  await user.type(screen.getByLabelText("Precio (CLP)"), precio);
  if (anterior) await user.type(screen.getByLabelText("Precio anterior (opcional)"), anterior);
  await user.type(screen.getByLabelText("Kilometraje"), "32000");
}

describe("FormularioVehiculo", () => {
  it("no envía si faltan campos obligatorios y marca la validación", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    const { container } = render(<FormularioVehiculo tipos={[]} onGuardar={onGuardar} onCancelar={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    expect(onGuardar).not.toHaveBeenCalled();
    expect(container.querySelector("form")).toHaveClass("was-validated");
  });

  it("envía los datos normalizados (sin oferta y con imagen por defecto)", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioVehiculo tipos={["SUV"]} onGuardar={onGuardar} onCancelar={() => {}} />);
    await llenar(user);
    await user.selectOptions(screen.getByLabelText("Transmisión"), "Mecánica");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({
        marca: "Kia", modelo: "Rio", tipo: "Sedán", precio: 10000000, precioAnterior: null,
        kilometraje: "32.000 km", transmision: "Mecánica", imagen: "/images/logo.png",
      })
    );
  });

  it("conserva el precio anterior solo si es mayor al precio (oferta)", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioVehiculo tipos={[]} onGuardar={onGuardar} onCancelar={() => {}} />);
    await llenar(user, { precio: "9000000", anterior: "12000000" });
    await user.type(screen.getByLabelText("URL de la imagen (opcional)"), "https://ejemplo.cl/auto.jpg");
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    expect(onGuardar).toHaveBeenCalledWith(
      expect.objectContaining({ precioAnterior: 12000000, imagen: "https://ejemplo.cl/auto.jpg" })
    );
  });

  it("descarta un precio anterior menor o igual al precio", async () => {
    const user = userEvent.setup();
    const onGuardar = vi.fn();
    render(<FormularioVehiculo tipos={[]} onGuardar={onGuardar} onCancelar={() => {}} />);
    await llenar(user, { precio: "9000000", anterior: "5000000" });
    await user.click(screen.getByRole("button", { name: "Guardar vehículo" }));
    expect(onGuardar).toHaveBeenCalledWith(expect.objectContaining({ precioAnterior: null }));
  });

  it("permite cambiar el color y cancelar", async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    render(<FormularioVehiculo tipos={[]} onGuardar={() => {}} onCancelar={onCancelar} />);
    const color = screen.getByLabelText("Color de fondo");
    expect(color).toHaveValue("#141416");
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancelar).toHaveBeenCalled();
  });
});
