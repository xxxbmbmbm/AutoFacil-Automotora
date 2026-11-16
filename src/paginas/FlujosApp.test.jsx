import { describe, it, expect, vi } from "vitest";
import { screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App.jsx";
import { renderConApp, iniciarComoAdmin, iniciarComoCliente, iniciarComoVendedor } from "../test/utils.jsx";
import { datosApiFalsa, apagarApiFalsa } from "../test/apiFalsa.js";

const enlacesMenu = () => within(screen.getByRole("navigation")).getAllByRole("link").map((a) => a.textContent).filter(Boolean);

function boleta(id, estado = "PAGADA") {
  return {
    id, usuarioId: 3, nombreCliente: "Cliente Prueba", correoCliente: "cliente@correo.cl", estado, total: 8990000,
    direccion: "Av. Providencia 1234", comuna: "Providencia", ciudad: "Santiago", fecha: "2026-11-16T12:00:00",
    detalles: [{ id: 1, vehiculoId: 1, descripcion: "Toyota Yaris 2021", subtotal: 8990000 }],
  };
}

function solicitud(id, nombre, telefono = "912345678") {
  return {
    id, nombre, correo: "ana@correo.cl", telefono, asunto: "Consulta general", mensaje: "Hola, quiero información",
    estado: "NUEVA", canalRespuesta: null, notasInternas: null, fechaCreacion: "2026-11-16T12:00:00",
    enlaces: { whatsapp: telefono && "https://wa.me/56912345678", correo: "mailto:ana@correo.cl", llamada: telefono && "tel:+56912345678" },
  };
}

describe("Accesos según el rol", () => {
  it("cada rol ve solo sus enlaces", async () => {
    renderConApp(<App />);
    expect(enlacesMenu()).toEqual(["Inicio", "Vehículos", "Acerca de nosotros", "Contacto"]);
  });

  it("el vendedor solo ve vehículos y órdenes", () => {
    iniciarComoVendedor();
    renderConApp(<App />);
    expect(enlacesMenu()).toEqual(["Vehículos", "Órdenes"]);
    expect(screen.getByText("Vendedor")).toBeInTheDocument();
  });

  it("las páginas protegidas piden sesión o bloquean al rol sin permiso", () => {
    renderConApp(<App />, { ruta: "/ordenes" });
    expect(screen.getByText("Inicia sesión para continuar")).toBeInTheDocument();

    iniciarComoCliente();
    for (const ruta of ["/ordenes", "/bandeja", "/usuarios"]) {
      const { unmount } = renderConApp(<App />, { ruta });
      expect(screen.getByText("No tienes acceso a esta sección")).toBeInTheDocument();
      unmount();
    }
  });
});

describe("Órdenes de compra", () => {
  it("el vendedor ve las órdenes y su detalle, pero no puede modificarlas", async () => {
    datosApiFalsa().boletas = [boleta(7)];
    const user = userEvent.setup();
    iniciarComoVendedor();
    renderConApp(<App />, { ruta: "/ordenes" });
    await user.click(await screen.findByRole("button", { name: "Ver detalle" }));
    expect(screen.getByText("Toyota Yaris 2021: $8.990.000")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Anular/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ocultar" }));
  });

  it("el administrador entrega, anula y elimina boletas", async () => {
    datosApiFalsa().boletas = [boleta(7)];
    datosApiFalsa().vehiculos[0].estado = "VENDIDO";
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/ordenes" });

    await user.click(await screen.findByRole("button", { name: "Ver detalle" }));
    await user.click(screen.getByRole("button", { name: "Marcar como entregada" }));
    expect(await screen.findByText("Entregada")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Anular boleta" }));
    expect(await screen.findByText("Anulada")).toBeInTheDocument();
    expect(datosApiFalsa().vehiculos[0].estado).toBe("DISPONIBLE");
    await user.click(screen.getByRole("button", { name: "Eliminar boleta" }));
    expect(await screen.findByText("Todavía no hay órdenes.")).toBeInTheDocument();
  });

  it("el cliente ve sus compras y los errores de carga", async () => {
    datosApiFalsa().boletas = [boleta(7), { ...boleta(8), usuarioId: 99 }];
    iniciarComoCliente();
    renderConApp(<App />, { ruta: "/mis-compras" });
    expect(await screen.findByRole("heading", { level: 1, name: "Mis compras" })).toBeInTheDocument();
    expect(await screen.findAllByRole("button", { name: "Ver detalle" })).toHaveLength(1);
  });

  it("muestra el error si no puede cargar", async () => {
    iniciarComoAdmin();
    apagarApiFalsa();
    renderConApp(<App />, { ruta: "/ordenes" });
    expect(await screen.findAllByText(/No pudimos conectar/)).not.toHaveLength(0);
  });
});

describe("Bandeja de contacto del administrador", () => {
  it("muestra notificaciones nuevas y permite atenderlas", async () => {
    datosApiFalsa().contactos = [solicitud(1, "Ana Pérez"), solicitud(2, "Luis Soto", null)];
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/bandeja" });

    expect(await screen.findByLabelText("Bandeja de contacto: 2 solicitudes nuevas")).toHaveTextContent("2");

    // Abrir marca la solicitud como "en proceso" y baja el contador
    await user.click(await screen.findByRole("button", { name: /Ana Pérez/ }));
    expect(await screen.findByRole("link", { name: /WhatsApp/ })).toHaveAttribute("href", "https://wa.me/56912345678");
    expect(screen.getByRole("link", { name: /Llamar/ })).toHaveAttribute("href", "tel:+56912345678");
    expect(screen.getByLabelText("Estado")).toHaveValue("EN_PROCESO");
    await waitFor(() => expect(screen.getByLabelText("Bandeja de contacto: 1 solicitudes nuevas")).toBeInTheDocument());

    // Marcar respondida sin canal: el backend lo rechaza
    await user.selectOptions(screen.getByLabelText("Estado"), "RESPONDIDA");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Indica por qué medio respondiste");

    await user.selectOptions(screen.getByLabelText("Respondido por"), "WHATSAPP");
    await user.type(screen.getByLabelText(/Notas internas/), "Le interesa el Yaris");
    await user.click(screen.getByRole("button", { name: "Guardar" }));
    expect(await screen.findByText("Cambios guardados.")).toBeInTheDocument();

    // Filtrar por estado y eliminar
    await user.click(screen.getByRole("button", { name: "Nueva" }));
    await user.click(await screen.findByRole("button", { name: /Luis Soto/ }));
    expect(screen.queryByRole("link", { name: /WhatsApp/ })).not.toBeInTheDocument(); // sin teléfono
    await user.click(screen.getByRole("button", { name: /Eliminar/ }));
    expect(await screen.findByText("No hay solicitudes en esta vista.")).toBeInTheDocument();
  });
});

describe("Usuarios", () => {
  it("el administrador crea, desactiva y elimina cuentas", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/usuarios" });

    await user.type(await screen.findByLabelText("Nombre"), "Pedro Soto");
    await user.type(screen.getByLabelText("Correo"), "pedro@autofacil.cl");
    await user.type(screen.getByLabelText("Contraseña"), "Clave123");
    await user.click(screen.getByRole("button", { name: /Crear/ }));
    const fila = (await screen.findByText("pedro@autofacil.cl")).closest("tr");
    expect(within(fila).getByText("Vendedor")).toBeInTheDocument();

    await user.click(within(fila).getByRole("button", { name: "Desactivar" }));
    expect(await within(fila).findByText("Desactivada")).toBeInTheDocument();
    await user.click(within(fila).getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(screen.queryByText("pedro@autofacil.cl")).not.toBeInTheDocument());

    // No puede desactivarse ni eliminarse a sí mismo
    const propia = screen.getByText("admin@autofacil.cl").closest("tr");
    expect(within(propia).queryByRole("button")).not.toBeInTheDocument();
  });

  it("muestra el error del servidor", async () => {
    const user = userEvent.setup();
    iniciarComoAdmin();
    renderConApp(<App />, { ruta: "/usuarios" });
    await screen.findByText("admin@autofacil.cl");
    datosApiFalsa().usuarios.find((u) => u.id === 1).rol = "CLIENTE";
    await user.type(screen.getByLabelText("Nombre"), "Pedro Soto");
    await user.type(screen.getByLabelText("Correo"), "pedro@autofacil.cl");
    await user.type(screen.getByLabelText("Contraseña"), "Clave123");
    await user.click(screen.getByRole("button", { name: /Crear/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No tienes permisos");
  });
});
