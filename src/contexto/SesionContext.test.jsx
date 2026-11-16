import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { CLAVE_SESION } from "./SesionContext.jsx";
import { renderConApp, iniciarComoCliente } from "../test/utils.jsx";
import { apagarApiFalsa, datosApiFalsa } from "../test/apiFalsa.js";

const sesionGuardada = () => JSON.parse(localStorage.getItem(CLAVE_SESION));

async function abrirModal(user) {
  renderConApp(<App />);
  await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));
}

async function ingresar(user, correo, clave) {
  if (correo) await user.type(screen.getByLabelText("Correo electrónico"), correo);
  if (clave) await user.type(screen.getByLabelText("Contraseña"), clave);
  await user.click(screen.getAllByRole("button", { name: "Ingresar" }).at(-1));
}

describe("Sesión con JWT", () => {
  it("inicia sesión, guarda los tokens y cierra sesión", async () => {
    const user = userEvent.setup();
    await abrirModal(user);
    await ingresar(user, "admin@autofacil.cl", "Prueba-Admin-1");

    expect(await screen.findByText("Administrador")).toBeInTheDocument();
    expect(sesionGuardada()).toMatchObject({ tokenAcceso: "token-1", tokenRenovacion: "renovar-1" });

    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("valida en el navegador y muestra el error del servidor", async () => {
    const user = userEvent.setup();
    await abrirModal(user);
    await ingresar(user, "no-es-correo");
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa un correo electrónico válido.");

    await user.clear(screen.getByLabelText("Correo electrónico"));
    await ingresar(user, "admin@autofacil.cl");
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu contraseña.");

    await ingresar(user, "", "mala");
    expect(await screen.findByRole("alert")).toHaveTextContent("Correo o contraseña incorrectos.");
  });

  it("registra un cliente nuevo y valida los datos del registro", async () => {
    const user = userEvent.setup();
    await abrirModal(user);
    await user.click(screen.getByRole("button", { name: "Registrarse" }));
    const crear = () => user.click(screen.getAllByRole("button", { name: "Crear cuenta" }).at(-1));

    await crear();
    expect(screen.getByRole("alert")).toHaveTextContent("Ingresa tu nombre.");
    await user.type(screen.getByLabelText("Nombre"), "Ana Pérez");
    await crear();
    expect(screen.getByRole("alert")).toHaveTextContent("correo electrónico válido");
    await user.type(screen.getByLabelText("Correo electrónico"), "ana@correo.cl");
    await user.type(screen.getByLabelText("Contraseña"), "123");
    await crear();
    expect(screen.getByRole("alert")).toHaveTextContent("al menos 6 caracteres");
    await user.type(screen.getByLabelText("Contraseña"), "456");
    await user.type(screen.getByLabelText("Repetir contraseña"), "otra");
    await crear();
    expect(screen.getByRole("alert")).toHaveTextContent("no coinciden");

    await user.clear(screen.getByLabelText("Repetir contraseña"));
    await user.type(screen.getByLabelText("Repetir contraseña"), "123456");
    await crear();
    expect(await screen.findByText("Ana Pérez")).toBeInTheDocument();
    expect(sesionGuardada().usuario.rol).toBe("CLIENTE");
  });

  it("la sesión sobrevive a una recarga y se confirma con el servidor", async () => {
    iniciarComoCliente();
    renderConApp(<App />);
    expect(screen.getByText("Cliente Prueba")).toBeInTheDocument();
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/auth/perfil"), expect.anything()));
    expect(screen.getByRole("link", { name: "Mis compras" })).toBeInTheDocument();
  });

  it("si el token venció lo renueva y reintenta; si no se puede renovar, cierra la sesión", async () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({
      tokenAcceso: "vencido", tokenRenovacion: "renovar-3", usuario: { id: 3, nombre: "Cliente Prueba", rol: "CLIENTE" },
    }));
    renderConApp(<App />);
    await waitFor(() => expect(sesionGuardada().tokenAcceso).toBe("token-3"));

    localStorage.setItem(CLAVE_SESION, JSON.stringify({
      tokenAcceso: "vencido", tokenRenovacion: "robado", usuario: { id: 3, nombre: "Cliente Prueba", rol: "CLIENTE" },
    }));
    renderConApp(<App />);
    await waitFor(() => expect(localStorage.getItem(CLAVE_SESION)).toBeNull());
  });

  it("ignora una sesión guardada corrupta", () => {
    localStorage.setItem(CLAVE_SESION, "{no-es-json");
    renderConApp(<App />);
    expect(screen.getByRole("button", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("avisa cuando el servidor no responde", async () => {
    const user = userEvent.setup();
    await abrirModal(user);
    apagarApiFalsa();
    await ingresar(user, "admin@autofacil.cl", "Prueba-Admin-1");
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos conectar con el servidor");
  });

  it("una cuenta desactivada pierde la sesión al recargar", async () => {
    iniciarComoCliente();
    datosApiFalsa().usuarios.find((u) => u.id === 3).activo = false;
    renderConApp(<App />);
    await waitFor(() => expect(localStorage.getItem(CLAVE_SESION)).toBeNull());
  });
});
