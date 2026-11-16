import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contacto from "./Contacto.jsx";
import { renderConApp, iniciarComoCliente } from "../test/utils.jsx";
import { apagarApiFalsa, datosApiFalsa } from "../test/apiFalsa.js";

async function llenar(user, telefono = "") {
  await user.type(screen.getByLabelText("Nombre completo"), "  Ana  ");
  await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
  if (telefono) await user.type(screen.getByLabelText("Teléfono (opcional)"), telefono);
  await user.selectOptions(screen.getByLabelText("Asunto"), "Quiero vender mi vehículo");
  await user.type(screen.getByLabelText("Mensaje"), "Quiero vender mi Suzuki 2019");
}

const enviar = (user) => user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

describe("Contacto", () => {
  it("muestra los datos de la automotora y pide sesión para escribir", () => {
    renderConApp(<Contacto />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Contacto");
    for (const titulo of ["Dirección", "Teléfono", "Correo", "Horario de atención"]) {
      expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
    }
    expect(screen.getByText("Inicia sesión para continuar")).toBeInTheDocument();
    expect(screen.queryByLabelText("Mensaje")).not.toBeInTheDocument();
  });

  it("valida, envía la solicitud al backend y limpia el formulario", async () => {
    const user = userEvent.setup();
    const alerta = vi.spyOn(window, "alert").mockImplementation(() => {});
    iniciarComoCliente();
    renderConApp(<Contacto />);

    await enviar(user);
    expect(screen.getByRole("button", { name: /Enviar mensaje/ }).closest("form")).toHaveClass("was-validated");
    expect(alerta).not.toHaveBeenCalled();

    await llenar(user, "abc");
    await enviar(user);
    expect(alerta).not.toHaveBeenCalled(); // teléfono inválido
    await user.clear(screen.getByLabelText("Teléfono (opcional)"));
    await user.type(screen.getByLabelText("Teléfono (opcional)"), "+56 9 1234 5678");
    await enviar(user);

    expect(await screen.findByLabelText("Mensaje")).toHaveValue("");
    expect(alerta).toHaveBeenCalledWith(expect.stringContaining("Gracias, Ana."));
    expect(datosApiFalsa().contactos[0]).toMatchObject({ nombre: "Ana", asunto: "Quiero vender mi vehículo", estado: "NUEVA" });
  });

  it("muestra el error si no se pudo enviar", async () => {
    const user = userEvent.setup();
    iniciarComoCliente();
    renderConApp(<Contacto />);
    await llenar(user);
    apagarApiFalsa();
    await enviar(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectar con el servidor");
  });
});
