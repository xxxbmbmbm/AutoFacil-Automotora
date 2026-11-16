import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TemaProvider } from "../contexto/TemaContext.jsx";
import { SesionProvider, CLAVE_SESION } from "../contexto/SesionContext.jsx";
import { VehiculosProvider } from "../contexto/VehiculosContext.jsx";
import { CUENTAS } from "./apiFalsa.js";

export function Proveedores({ children, ruta = "/" }) {
  return (
    <MemoryRouter initialEntries={[ruta]}>
      <TemaProvider>
        <SesionProvider>
          <VehiculosProvider>{children}</VehiculosProvider>
        </SesionProvider>
      </TemaProvider>
    </MemoryRouter>
  );
}

export function renderConApp(ui, { ruta = "/" } = {}) {
  return render(<Proveedores ruta={ruta}>{ui}</Proveedores>);
}

/** Deja guardada una sesión válida (como si el usuario hubiera iniciado sesión antes de recargar). */
function iniciarComo({ id, nombre, correo, rol }) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({
    tokenAcceso: `token-${id}`,
    tokenRenovacion: `renovar-${id}`,
    usuario: { id, nombre, correo, rol, activo: true },
  }));
}

export const iniciarComoAdmin = () => iniciarComo(CUENTAS.admin);
export const iniciarComoVendedor = () => iniciarComo(CUENTAS.vendedor);
export const iniciarComoCliente = () => iniciarComo(CUENTAS.cliente);
