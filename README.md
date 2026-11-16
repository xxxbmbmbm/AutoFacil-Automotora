# AutoFacil — Frontend (React + Vite)

Tienda AutoFacil conectada al backend de microservicios Spring Boot (repositorio `autofacil-backend`).

```powershell
npm install
npm run dev          # desarrollo en http://localhost:5173
npm run test         # pruebas + cobertura (mínimo 80%)
npm run build        # corre las pruebas y, si pasan, arma la página en /dist
```

## Conexión con el backend

Las URL de los 4 microservicios se leen de variables de entorno de Vite:

| Archivo | Uso |
| --- | --- |
| (sin archivo) | Backend local: `src/api/cliente.js` usa `http://localhost:8081` a `8084` por defecto |
| `.env.development.local` | **Tiene prioridad.** Copiar desde `.env.development.local.example` y poner la IP pública de EC2. No se sube a GitHub. |

```powershell
Copy-Item .env.development.local.example .env.development.local
notepad .env.development.local   # reemplazar IP_PUBLICA y reiniciar Vite
```

`src/api/cliente.js` hace las llamadas con `fetch`. Toda petición con sesión pasa por `api()` de `SesionContext`, que agrega `Authorization: Bearer <token>`.

## Sesión y seguridad

- **Login y registro:** `POST /auth/login` y `/auth/registro` devuelven un token de acceso (JWT, 15 min) y un token de renovación.
- **Persistencia:** la sesión se guarda en `localStorage` (`sesionAutoFacil`), así sobrevive a recargas de página. Al cargar, la app confirma la sesión con `GET /auth/perfil`. Si la cuenta fue desactivada o el token es inválido, la sesión se cierra.
- **Renovación automática:** si una petición responde 401, se pide un token nuevo con `/auth/renovar` y se reintenta una vez. El token de renovación se rota en cada uso. Si ya no sirve, se cierra la sesión.
- **Cerrar sesión:** borra la sesión local y revoca el token de renovación en el servidor.
- Ninguna contraseña ni dato de tarjeta queda en el código ni se envía al backend. El pago es solo demostrativo.

## Restricciones por rol

| Rol | Menú | Páginas protegidas |
| --- | --- | --- |
| Visitante | Inicio, Vehículos, Acerca de nosotros, Contacto | Comprar y Contacto piden iniciar sesión |
| `CLIENTE` | Lo anterior + Mis compras | `/mis-compras` |
| `VENDEDOR` | Solo Vehículos y Órdenes (sin botones de compra ni edición) | `/ordenes` (solo lectura), `/vehiculos/:id` |
| `ADMIN` | Todo + Órdenes, Usuarios y campana de notificaciones | `/ordenes`, `/usuarios`, `/bandeja` |

`RutaProtegida` muestra "Inicia sesión para continuar" o "No tienes acceso a esta sección" según el caso. Es solo una ayuda visual: la protección real la aplica el backend en cada endpoint con el rol del JWT.

**Bandeja de contacto (admin):** la campana muestra cuántas solicitudes nuevas hay (se consulta cada 60 s). En `/bandeja` cada mensaje trae botones para responder por **WhatsApp, correo o llamada**, más estado, canal de respuesta y notas internas.

## Pruebas

Las pruebas usan un backend simulado en memoria (`src/test/apiFalsa.js`) que responde las mismas rutas y reglas de rol que los microservicios, así que no necesitan Docker. Las cuentas de prueba están en ese archivo.
