import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacto from "./Contacto.jsx";

// Un valor "" o null significa "dejar el campo sin completar".
async function llenar(user, cambios = {}) {
  const v = {
    nombre: "Ana",
    correo: "ana@correo.cl",
    telefono: "",
    asunto: "Otro",
    mensaje: "Hola, necesito ayuda con un auto",
    ...cambios,
  };
  if (v.nombre) await user.type(screen.getByLabelText("Nombre completo"), v.nombre);
  if (v.correo) await user.type(screen.getByLabelText("Correo electrónico"), v.correo);
  if (v.telefono) await user.type(screen.getByLabelText("Teléfono (opcional)"), v.telefono);
  if (v.asunto) await user.selectOptions(screen.getByLabelText("Asunto"), v.asunto);
  if (v.mensaje) await user.type(screen.getByLabelText("Mensaje"), v.mensaje);
}

const enviar = (user) => user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

describe("Contacto - información", () => {
  it("muestra el encabezado de la página", () => {
    render(<Contacto />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contacto");
    expect(screen.getByText("Hablemos")).toBeInTheDocument();
  });

  it("muestra dirección, teléfono, correo y horario", () => {
    render(<Contacto />);
    expect(screen.getByRole("heading", { level: 6, name: "Dirección" })).toBeInTheDocument();
    expect(screen.getByText("Av. Principal 1234, Santiago, Chile")).toBeInTheDocument();
    expect(screen.getByText("+56 9 1234 5678")).toBeInTheDocument();
    expect(screen.getByText("contacto@autofacil.cl")).toBeInTheDocument();
    expect(screen.getByText("Lunes a sábado, 9:30 a 19:00 hrs")).toBeInTheDocument();
  });

  it("ofrece las opciones de asunto, con una opción inicial deshabilitada", () => {
    render(<Contacto />);
    expect(screen.getByRole("option", { name: "Selecciona una opción" })).toBeDisabled();
    for (const opcion of ["Consulta por un vehículo", "Quiero vender mi vehículo", "Consulta general", "Otro"]) {
      expect(screen.getByRole("option", { name: opcion })).toBeInTheDocument();
    }
  });
});

describe("Contacto - validación del formulario", () => {
  it("no marca el formulario como validado antes de enviar", () => {
    const { container } = render(<Contacto />);
    expect(container.querySelector("form")).not.toHaveClass("was-validated");
  });

  it("al enviar vacío marca la validación y no muestra ninguna alerta", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = render(<Contacto />);
    await enviar(user);
    expect(container.querySelector("form")).toHaveClass("was-validated");
    expect(alerta).not.toHaveBeenCalled();
  });

  it.each([
    ["falta el nombre", { nombre: "" }],
    ["el correo no es válido", { correo: "no-es-correo" }],
    ["falta el correo", { correo: "" }],
    ["el teléfono opcional tiene un formato inválido", { telefono: "abc" }],
    ["no se eligió un asunto", { asunto: null }],
    ["falta el mensaje", { mensaje: "" }],
  ])("no envía si %s", async (_descripcion, cambios) => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Contacto />);
    await llenar(user, cambios);
    await enviar(user);
    expect(alerta).not.toHaveBeenCalled();
  });
});

describe("Contacto - envío", () => {
  it("envía con los datos mínimos y saluda por el nombre sin espacios sobrantes", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Contacto />);
    await llenar(user, { nombre: "  Ana  " });
    await enviar(user);
    expect(alerta).toHaveBeenCalledTimes(1);
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("¡Gracias, Ana!"));
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Un asesor de AutoFacil se pondrá en contacto"));
  });

  it("acepta un teléfono con formato válido", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    render(<Contacto />);
    await llenar(user, { telefono: "+56912345678" });
    await enviar(user);
    expect(alerta).toHaveBeenCalledTimes(1);
  });

  it("limpia el formulario y la validación después de enviar", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    const { container } = render(<Contacto />);
    await llenar(user, { telefono: "+56912345678" });
    await enviar(user);
    expect(screen.getByLabelText("Nombre completo")).toHaveValue("");
    expect(screen.getByLabelText("Correo electrónico")).toHaveValue("");
    expect(screen.getByLabelText("Teléfono (opcional)")).toHaveValue("");
    expect(screen.getByLabelText("Mensaje")).toHaveValue("");
    expect(container.querySelector("form")).not.toHaveClass("was-validated");
  });
});
