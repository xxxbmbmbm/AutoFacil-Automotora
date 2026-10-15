import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SesionProvider, useSesion, CLAVE_SESION, CLAVE_USUARIOS } from "./SesionContext.jsx";
import { ADMIN } from "../datos/admin.js";

const montar = () => renderHook(() => useSesion(), { wrapper: SesionProvider });
const usuarioGuardado = { nombre: "Ana", correo: "ana@correo.cl", clave: "secreto1" };

describe("SesionContext - estado inicial", () => {
  it("sin sesión guardada no hay usuario", () => {
    const { result } = montar();
    expect(result.current.usuario).toBeNull();
    expect(result.current.esAdmin).toBe(false);
    expect(result.current.modalAbierto).toBe(false);
  });

  it("restaura la sesión del administrador", () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: ADMIN.correo }));
    const { result } = montar();
    expect(result.current.usuario.rol).toBe("admin");
    expect(result.current.esAdmin).toBe(true);
  });

  it("restaura la sesión de un usuario registrado", () => {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([usuarioGuardado]));
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: usuarioGuardado.correo }));
    const { result } = montar();
    expect(result.current.usuario).toEqual({ nombre: "Ana", correo: "ana@correo.cl", rol: "usuario" });
    expect(result.current.esAdmin).toBe(false);
  });

  it("ignora una sesión de un usuario que ya no existe", () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: "fantasma@correo.cl" }));
    expect(montar().result.current.usuario).toBeNull();
  });

  it("ignora una sesión sin correo", () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({}));
    expect(montar().result.current.usuario).toBeNull();
  });

  it("ignora datos corruptos en localStorage", () => {
    localStorage.setItem(CLAVE_SESION, "{no-es-json");
    expect(montar().result.current.usuario).toBeNull();
  });
});

describe("SesionContext - iniciarSesion", () => {
  it("valida correo y contraseña", () => {
    const { result } = montar();
    expect(result.current.iniciarSesion("malo", "x")).toMatch(/correo/i);
    expect(result.current.iniciarSesion("ana@correo.cl", "")).toMatch(/contraseña/i);
  });

  it("rechaza al admin con clave incorrecta", () => {
    const { result } = montar();
    expect(result.current.iniciarSesion(ADMIN.correo, "otra")).toMatch(/incorrectos/);
    expect(result.current.usuario).toBeNull();
  });

  it("inicia sesión como admin (ignora mayúsculas y espacios en el correo)", () => {
    const { result } = montar();
    let error;
    act(() => { error = result.current.iniciarSesion("  ADMIN@autofacil.CL ", ADMIN.clave); });
    expect(error).toBeNull();
    expect(result.current.esAdmin).toBe(true);
    expect(JSON.parse(localStorage.getItem(CLAVE_SESION))).toEqual({ correo: ADMIN.correo });
  });

  it("rechaza credenciales de usuario inexistente o clave errónea", () => {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([usuarioGuardado]));
    const { result } = montar();
    expect(result.current.iniciarSesion("ana@correo.cl", "mala")).toMatch(/incorrectos/);
    expect(result.current.iniciarSesion("otro@correo.cl", "secreto1")).toMatch(/incorrectos/);
  });

  it("inicia sesión como usuario normal", () => {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([usuarioGuardado]));
    const { result } = montar();
    act(() => { result.current.iniciarSesion("ana@correo.cl", "secreto1"); });
    expect(result.current.usuario.rol).toBe("usuario");
    expect(result.current.esAdmin).toBe(false);
  });
});

describe("SesionContext - registrarUsuario", () => {
  it("valida cada campo", () => {
    const { result } = montar();
    const r = result.current.registrarUsuario;
    expect(r("A", "a@b.cl", "123456", "123456")).toMatch(/nombre/i);
    expect(r("Ana", "no-correo", "123456", "123456")).toMatch(/correo/i);
    expect(r("Ana", "a@b.cl", "123", "123")).toMatch(/6 caracteres/);
    expect(r("Ana", "a@b.cl", "123456", "654321")).toMatch(/no coinciden/);
    expect(r("Ana", ADMIN.correo, "123456", "123456")).toMatch(/reservado/);
  });

  it("crea el usuario, guarda y abre sesión", () => {
    const { result } = montar();
    let error;
    act(() => { error = result.current.registrarUsuario(" Ana ", "ANA@correo.cl", "secreto1", "secreto1"); });
    expect(error).toBeNull();
    expect(result.current.usuario).toEqual({ nombre: "Ana", correo: "ana@correo.cl", rol: "usuario" });
    expect(JSON.parse(localStorage.getItem(CLAVE_USUARIOS))).toHaveLength(1);
  });

  it("no permite correos duplicados", () => {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify([usuarioGuardado]));
    const { result } = montar();
    expect(result.current.registrarUsuario("Otra", "ana@correo.cl", "secreto1", "secreto1")).toMatch(/Ya existe/);
  });
});

describe("SesionContext - cerrar sesión y modal", () => {
  it("cierra sesión y limpia el almacenamiento", () => {
    localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: ADMIN.correo }));
    const { result } = montar();
    act(() => result.current.cerrarSesion());
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem(CLAVE_SESION)).toBeNull();
  });

  it("abre y cierra el modal; iniciar sesión lo cierra", () => {
    const { result } = montar();
    act(() => result.current.setModalAbierto(true));
    expect(result.current.modalAbierto).toBe(true);
    act(() => { result.current.iniciarSesion(ADMIN.correo, ADMIN.clave); });
    expect(result.current.modalAbierto).toBe(false);
  });
});
