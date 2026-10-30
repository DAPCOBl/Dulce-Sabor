# Dulce Sabor — Frontend

React + Vite, JavaScript. La autenticación está conectada a la API de `back`.

## Ejecutar

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `VITE_API_URL` en `.env.local`; por defecto `http://localhost:3000/api`.
El backend debe estar activo y permitir el origen del frontend en `FRONTEND_URL`
(por defecto `http://localhost:5173`). Reinicia Vite si cambias variables de entorno.
`.env.local` está excluido de Git; las variables VITE son públicas, no guardes secretos.

## Autenticación

Usa una cuenta activa registrada en el backend. Para preparar el administrador,
configura `ADMIN_NOMBRE`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el `.env` de **back**,
y ejecuta allí:

```bash
npm run crear-admin
npm run dev
```

Los correos y contraseñas de demostración del prototipo ya no permiten iniciar sesión.
No se crean cuentas ni se modifican contraseñas del backend desde este login.
La recuperación de contraseña indica al usuario que debe solicitar el restablecimiento
al administrador; todavía no hay recuperación automatizada por correo.

- Login: `POST /auth/login`. Normaliza correo, conserva la contraseña tal como se escribió
  y bloquea envíos repetidos mientras espera.
- Guarda token, usuario público y vencimiento en `sessionStorage`, por pestaña. Nunca
  almacena la contraseña desde auth. «Recordar correo» solo guarda el correo en `localStorage`.
- Al recargar, valida el token con `GET /auth/me` antes de mostrar el contenido protegido.
  Los roles y nombres se actualizan con la respuesta del servidor, no con el usuario guardado.
- Revalida al volver a la pestaña y cada minuto mientras está visible. Al vencer el token
  o recibir 401, elimina la sesión y muestra el login. Un 403 no cierra la sesión.
- Ante un fallo de conexión al validar, permite reintentar y conserva el token; no entra
  a las pantallas privadas usando únicamente el contenido almacenado.
- Logout: `POST /auth/logout` para revocar el token, y después elimina la sesión local.
  Si falla la conexión, limpia el navegador e informa que no pudo confirmar la revocación.
- Las sesiones antiguas del prototipo en `localStorage` se descartan.

## Organización

```text
src/
  services/
    api.js        Cliente JSON, Bearer, timeout y manejo de errores/401
    session.js    Estado compartido y almacenamiento de la sesión
    auth.js       Login, validación y logout contra la API
  hooks/
    useAuth.js    Verificación, vencimiento, reintentos y ciclo de sesión
  components/
    LoginForm.jsx Formulario de acceso
    AuthStatus.jsx Estados de verificación, error y cierre
  pages/
    Login.jsx     Página pública de acceso
    Home.jsx      Vista según el rol validado
  App.jsx         Control de acceso y sesión
```

**Alcance de esta entrega:** autenticación. Productos, inventario, ventas, reportes y
la pantalla de administración de usuarios todavía consumen los mocks de `src/data`
y los servicios locales. Crear o editar usuarios en esa pantalla local no crea ni
modifica cuentas del backend. Esos módulos se conectarán en las siguientes entregas.

## Verificación

```bash
npm test         # pruebas del cliente de API y autenticación, sin servidor
npm run lint
npm run build
npm run preview
```

Prueba manual con backend activo: ingresar con credenciales incorrectas, ingresar con
una cuenta válida de cada rol, recargar, cerrar sesión y comprobar que requiere volver
a ingresar. Desactivar una cuenta o revocar su sesión en el backend debe devolverla
al login en la siguiente validación. Con el backend desconectado, la aplicación debe
mostrar un error y permitir reintentar sin aceptar credenciales de demostración.
