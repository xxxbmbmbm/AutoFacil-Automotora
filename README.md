# AutoFacil Automotora

Tienda web de vehículos nuevos y usados. Los clientes revisan el catálogo, compran y escriben a la automotora; los vendedores consultan vehículos y órdenes, y los administradores gestionan todo el sistema.

Proyecto de **DSY1104 Desarrollo Fullstack II** (Duoc UC).
**Integrantes:** Bastián Espejo · Felipe Vilches · Tomás Acuña

Este repositorio contiene el **frontend** (React + Vite). El backend son 4 microservicios Spring Boot con MySQL, desplegados en AWS EC2 con Docker.

## Funcionalidades

**Tienda (todos)**
- Inicio con oferta destacada, vitrina de vehículos y marcas disponibles.
- Catálogo con filtros por marca, tipo de vehículo y rango de precio; ofertas con precio anterior tachado.
- Ficha completa de cada vehículo.
- Páginas de información de la automotora y de contacto, modo claro y oscuro, diseño responsivo.

**Cliente**
- Registro e inicio de sesión; la sesión se mantiene al recargar la página.
- Compra de vehículos con dirección de entrega: se genera una boleta y el vehículo sale de la tienda.
- *Mis compras*: historial de boletas con su estado y detalle.
- Formulario de contacto (requiere sesión iniciada).

**Vendedor**
- Ve el catálogo completo (incluidos los vendidos) y la ficha de cada vehículo.
- Ve las órdenes de compra y su detalle. No ve ninguna otra opción.

**Administrador**
- Agrega y elimina vehículos.
- Gestiona órdenes: marcar como entregada, anular (los vehículos vuelven a la tienda) y eliminar anuladas.
- Bandeja de contacto con notificaciones: la campana muestra cuántos mensajes nuevos hay y cada mensaje tiene accesos directos para responder por **WhatsApp, correo o llamada**, además de estado, canal de respuesta y notas internas.
- Administración de usuarios: crear vendedores u otros administradores, desactivar y eliminar cuentas.

## Arquitectura

```text
Navegador (React + Vite)
   │  fetch + Authorization: Bearer <JWT>
   ├──► ms-usuarios  :8081 ──► MySQL   Registro, login, JWT, renovación de tokens, usuarios
   ├──► ms-vehiculos :8082 ──► MySQL   Catálogo de vehículos y categorías
   ├──► ms-ventas    :8083 ──► MySQL   Boletas y su detalle
   │        └──► ms-vehiculos           Consulta disponibilidad y marca VENDIDO
   └──► ms-contacto  :8084 ──► MySQL   Formulario de contacto y bandeja del administrador
```

Cada microservicio tiene su propia base de datos y la misma estructura en capas: modelo, repositorio, DTO, servicio y controlador. Todas las rutas están versionadas (`/api/v1/...`) y documentadas en **Swagger** (`/swagger-ui.html` en cada servicio).

### Modelo de datos

`USUARIO → BOLETA → DETALLE_BOLETA ← PRODUCTO (vehículo) ← CATEGORIA`, más las tablas `token_renovacion` y `solicitud_contacto`.

## Seguridad

- Inicio de sesión con **JWT** (HS256, 15 minutos) y token de renovación (7 días) que se rota en cada uso y se revoca al cerrar sesión.
- Contraseñas cifradas con BCrypt; en la base de datos solo se guarda el hash de los tokens de renovación.
- Roles **ADMIN**, **VENDEDOR** y **CLIENTE**. El backend valida el rol en cada petición (401 sin sesión, 403 sin permiso) y el frontend muestra a cada rol solo sus opciones.
- La sesión se guarda en `localStorage` para sobrevivir a recargas, se confirma con el servidor al cargar la página y se renueva sola cuando el token vence.
- El pago es demostrativo: los datos de la tarjeta se validan en pantalla y nunca se envían al servidor.
- Ninguna clave ni secreto vive en el frontend; los del backend están solo en el `.env` del servidor.

## Despliegue en AWS

| Pieza | Dónde | Enlace |
| --- | --- | --- |
| Frontend | Bucket **S3** con hosting de sitio web estático | http://autofacil-frontend-bastian-espejo.s3-website-us-east-1.amazonaws.com |
| Reporte de cobertura | Bucket **S3** aparte | http://autofacil-coverage-bastian-espejo.s3-website-us-east-1.amazonaws.com |
| Backend (4 microservicios + MySQL) | Instancia **EC2** con **IP elástica** | `http://34.234.168.134:8081` a `8084` |

1. **EC2:** Amazon Linux 2023, t3.medium, con Docker, Docker Compose y Buildx. `docker compose up --build -d` levanta MySQL y los 4 microservicios; los contenedores se reinician solos al encender la instancia.
2. **IP elástica:** la instancia tiene la IP fija `34.234.168.134`, así que no cambia al reiniciar el Learner Lab y el frontend publicado siempre la encuentra.
3. **Grupo de seguridad:** los puertos 8081 a 8084 están abiertos para que el navegador de cualquier visitante llegue a la API (las rutas privadas exigen JWT); SSH solo para las IP autorizadas y MySQL no queda expuesto a internet.
4. **S3:** `npm run build` genera `dist/` con la IP fija ya incluida y se sube al bucket del frontend; `npm run test` genera `coverage/`, que se sube al bucket de cobertura. Ambos buckets tienen lectura pública y `index.html` como documento de inicio (el frontend también lo usa como documento de error, para que las rutas de React funcionen al recargar).

## Ejecutar el frontend

Requisitos: Node.js 22 o superior.

```powershell
npm install
Copy-Item .env.development.local.example .env.development.local
npm run dev                      # http://localhost:5173
```

El ejemplo ya apunta a la IP elástica de EC2. Sin `.env.development.local`, la aplicación apunta a un backend local (`http://localhost:8081` a `8084`). Para compilar la versión de S3 se usa el mismo contenido en `.env.production.local`.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run test` | Pruebas con cobertura (mínimo 80%) |
| `npm run build` | Ejecuta las pruebas y genera la versión de producción en `dist/` |

## Tecnologías

**Frontend:** React 19, Vite 8, React Router 7, Bootstrap 5, Vitest y Testing Library.
**Backend:** Spring Boot 4, Java 21, Spring Data JPA, Spring Security, JWT, Swagger (springdoc-openapi), MySQL 8.
**Infraestructura:** Docker, Docker Compose, AWS EC2 (IP elástica), AWS S3.
