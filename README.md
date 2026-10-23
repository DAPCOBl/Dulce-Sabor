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
├── services/     # consumo de la API (api.js)
├── App.jsx       # raíz de la aplicación
└── main.jsx      # punto de entrada
```

## Usuarios de prueba (solo frontend)

| Rol             | Correo                  | Contraseña  |
| --------------- | ----------------------- | ----------- |
| Administrador   | ana@dulcesabor.ejemplo  | admin1234   |
| Cajero          | carlos@dulcesabor.ejemplo | caja1234  |

Definidos en `src/services/auth.js` (mock, sin backend). El rol decide qué pantalla se muestra tras el login.

## Variables de entorno

| Variable        | Descripción                    | Por defecto               |
| --------------- | ------------------------------ | ------------------------- |
| `VITE_API_URL`  | URL base del backend           | `http://localhost:3000/api` |

Crear un archivo `.env.local` para sobreescribir valores.
