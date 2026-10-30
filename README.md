# Dulce Sabor — Frontend

React + Vite. Todos los módulos consumen la API del backend: autenticación,
usuarios, productos, inventario, POS, ventas, dashboard, reportes y gastos.

## Ejecutar

```bash
npm install
cp .env.example .env.local
npm run dev
```

`VITE_API_URL` apunta por defecto a `http://localhost:3000/api`. El backend debe
estar activo y `FRONTEND_URL` debe permitir el origen de Vite, por defecto
`http://localhost:5173`. Reinicia Vite al cambiar las variables de entorno.

En `back`, configura `.env`, crea un administrador con `npm run crear-admin` y
arranca con `npm run dev`. Usa una cuenta activa del backend. Puedes crear productos
desde la pantalla y cargar sus existencias desde inventario. El comando de semillas
del backend es opcional para desarrollo: el frontend no carga datos de demostración.

## Datos y sesión

- Los registros viven en SQLite y se consultan mediante `src/services`. Se eliminaron
  `src/data` y el estado comercial local de `services/estado.js`.
- El frontend no persiste usuarios, productos, stock, ventas o métricas en localStorage.
  Las claves comerciales antiguas del prototipo se limpian al iniciar.
- Los errores de red se muestran con opción de reintentar; no se sustituyen por datos
  simulados. Los registros vacíos se muestran como vacíos.
- Los filtros y paginación de usuarios, productos, inventario, ventas administrativas
  y gastos se envían al servidor. El catálogo del POS y sus ventas del día recorren
  todas las páginas de la API antes de filtrar en la pantalla.
- Tras una operación confirmada se vuelven a consultar los datos. También se refrescan
  al volver a la pestaña y cada minuto mientras permanezca visible.
- Las listas y errores se aíslan por sesión; se cancelan peticiones anteriores al
  cambiar filtros o usuario. Un 401 limpia la sesión y un 403 muestra falta de permisos.

La sesión guarda token, usuario público y vencimiento en sessionStorage. Al recargar
se valida con `/auth/me` antes de mostrar pantallas privadas. Se revalida al volver a
la pestaña y cada minuto. Logout llama a la API para revocar el token; si no puede
confirmarlo, limpia el navegador y lo informa. «Recordar correo» solo guarda el correo.
Las contraseñas de demostración dejaron de funcionar. No se guarda la contraseña
introducida. El restablecimiento de contraseñas se realiza desde Usuarios por un
administrador; todavía no hay recuperación automática por correo.

## Operaciones

**Usuarios:** crear, editar, cambiar estado y eliminar mediante `/usuarios`. Se muestran
los conflictos del último administrador o de cuentas con historial. Las contraseñas
siguen las reglas del backend (mínimo 8 caracteres, máximo 72 bytes) y no se recortan.

**Productos:** `/productos` proporciona categorías y estados. El SKU puede dejarse
vacío al crear para asignarlo en el servidor. Los nuevos productos empiezan con cero
unidades. La imagen se envía como data URL con el límite de 2 MiB del backend; los
precios y costos son enteros COP. Las existencias se registran desde inventario.

**Inventario:** existencias, indicadores, categorías, motivos y movimientos vienen de
`/inventario`. Entradas suman unidades y ajustes fijan el conteo físico. El producto
se consulta al abrir el formulario. El responsable siempre es el usuario autenticado.
El historial tiene fecha y paginación. Los movimientos también envían Idempotency-Key;
si se pierde la respuesta, el borrador queda en sessionStorage por usuario y puede
confirmarse al volver a abrir el formulario, sin sumar una entrada dos veces. Mientras
está pendiente, se bloquea editar ese movimiento. Requiere el backend con la migración
de `operaciones_inventario` (commit `4f0f975`); la tabla se crea automáticamente al arrancar.

**POS:** solo ofrece productos activos de la API. El carrito es un borrador; el servidor
calcula los importes, valida stock y registra el comprobante. Los recibos usan las
fechas reales de venta en America/Bogota. Cada cobro lleva Idempotency-Key. Si la
respuesta se pierde, el intento queda en sessionStorage y se reintenta con la misma
clave, incluso tras recargar. Mientras exista un cobro incierto se bloquea cambiarlo
o crear otro. La confirmación y el historial siempre vienen del servidor.

**Reportes:** `/reportes/resumen` alimenta el dashboard. `/reportes/ventas` entrega
la serie diaria, los desgloses y el balance; `/reportes/exportar` descarga CSV. No se
suman ingresos locales ni se estiman gastos con porcentajes fijos. Al filtrar por
cajero o método, se muestra utilidad bruta y gastos sin asignar, tal como los devuelve
el backend. El filtro por cajero usa IDs, incluidos usuarios con el mismo nombre.

**Gastos:** registrar importes reales y anular con motivo obligatorio desde la nueva
sección Gastos. Los registros no se borran; las anulaciones conservan su auditoría y
se reflejan en el balance.

## Organización

```text
src/
  services/     Cliente HTTP y operaciones por módulo
  hooks/        Ciclo de auth y consultas remotas
  config/       Configuración visual de sede y moneda
  utils/        Formato de fechas y cálculos de vista previa
  components/   Pantallas y componentes reutilizables
  pages/        Vistas por rol
```

Los valores estáticos restantes son etiquetas, estados del protocolo y configuración
visual de sede/moneda; las cuentas, fichas, saldos, movimientos, cobros y reportes se
obtienen siempre de la API.

## Verificación

```bash
npm test
npm run lint
npm run build
```

Las pruebas de servicios cubren autenticación, paginación completa, errores de servidor,
confirmación de mutaciones, gastos y reintentos de cobros. También se comprobaron en
Chromium los flujos reales con Express y SQLite temporales: creación y persistencia de
usuarios/productos, entradas/ajustes, cobro con pérdida de respuesta y recarga,
historiales, dashboard, reportes, CSV y registro/anulación de gastos.
