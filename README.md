# Dulce Sabor - Frontend

Frontend del proyecto **Dulce Sabor** (React + Vite, JavaScript).

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (HMR)
npm run build    # build de producción en dist/
npm run preview  # previsualizar el build
npm run lint     # lint (oxlint)
```

## Estructura

```
src/
├── assets/       # imágenes y estáticos
├── components/   # componentes reutilizables
├── pages/        # páginas de la aplicación
├── routes/       # definición de rutas
├── services/     # estado, usuarios y helpers de datos
├── App.jsx       # raíz de la aplicación
└── main.jsx      # punto de entrada
```

## Usuarios de prueba (solo frontend)

| Rol             | Correo                  | Contraseña  |
| --------------- | ----------------------- | ----------- |
| Administrador   | cristian@dulcesabor.com | admin       |
| Cajero          | renzo@dulcesabor.com    | cajero      |

Definidos en `src/services/usuarios.js` (datos simulados). El rol decide qué pantalla se muestra tras el login.

## Despliegue con Docker y Render

El despliegue publica el prototipo con datos simulados. No necesita una API ni
variables de entorno de Vite. Usuarios, sesión y operaciones se conservan en
`localStorage`: cada navegador mantiene sus propios datos de demostración.

El `Dockerfile` compila el frontend con Node.js 22 y sirve `dist/` con Nginx.
Nginx utiliza `PORT` al arrancar (por defecto `10000`) y expone `/healthz` para
comprobar que el servicio responde.

### Probar con Docker

Con Docker instalado y en ejecución, desde la raíz del repositorio:

```bash
docker build -t dulce-sabor-front .
docker run --rm -p 8080:10000 --name dulce-sabor-front dulce-sabor-front
```

Abrir `http://localhost:8080`. Para comprobar el servicio:

```bash
curl --fail http://localhost:8080/healthz
```

### Publicar en Render con Blueprint

1. Subir estos archivos a GitHub en la rama `feat/deploy-render`.
2. En Render, seleccionar **New > Blueprint** y conectar este repositorio.
3. Seleccionar la rama `feat/deploy-render` y el archivo `render.yaml`.
4. Revisar el servicio `dulce-sabor-front` y confirmar su creación.
5. Esperar a que termine el despliegue y abrir la URL asignada por Render.

El Blueprint configura un Web Service Docker en el plan gratuito, con despliegue
automático al subir cambios a esa rama. Cuando se cambie la rama de despliegue,
actualizar también `branch` en `render.yaml`.

### Configuración manual alternativa

Si se utiliza **New > Web Service** en lugar del Blueprint:

| Campo | Valor |
| --- | --- |
| Branch | `feat/deploy-render` |
| Language | `Docker` |
| Root Directory | Vacío (este frontend está en la raíz de su repositorio) |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context Directory | `.` |
| Docker Command | Vacío (utiliza el comando del Dockerfile) |
| Health Check Path | `/healthz` |
| Variable `PORT` | `10000` |
| Instance Type | `Free` |

Render ejecuta la compilación y el arranque definidos en el Dockerfile; no hace
falta configurar comandos de npm en su panel.

Documentación: [Docker en Render](https://render.com/docs/docker) y
[Blueprints](https://render.com/docs/blueprint-spec).
