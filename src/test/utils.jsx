import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { TemaProvider } from "../contexto/TemaContext.jsx";
import { SesionProvider, CLAVE_SESION } from "../contexto/SesionContext.jsx";
import { VehiculosProvider } from "../contexto/VehiculosContext.jsx";
import { ADMIN } from "../datos/admin.js";

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

export function iniciarComoAdmin() {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ correo: ADMIN.correo }));
}
