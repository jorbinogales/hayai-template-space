# hayai-template-space

Plantilla desplegable de **HAYAI Space**: el sistema interno de HAYAI (clientes, proyectos, cobros, gastos, finanzas y tareas) con interfaz espacial en 3D. Viene lista para probar: entras con un usuario por defecto y ya hay datos de ejemplo.

> **Acceso por defecto:** usuario `admin` · clave `000000`

![Home](home.png)

## Qué incluye

- Web React + Three.js, API Express y Postgres 16, todo en una sola imagen Docker (más la base de datos).
- **Modo demo** (`DEMO_MODE=true`, activado por defecto en esta plantilla): un único usuario `admin`, datos de ejemplo y la clave bloqueada para que nadie la cambie ni deje fuera a los demás.
- Documentación completa en [`docs/`](docs/README.md).

## Arranque rápido

### Local (sin Docker)

```bash
npm install
cp .env.example .env          # ya trae DEMO_MODE=true
npm run dev:all               # BD embebida + API (:3001) + web (:5173)
```

Abre http://localhost:5173 → usuario `admin`, clave `000000`.

### Servidor (Docker)

```bash
cp .env.production.example .env     # edita POSTGRES_PASSWORD (openssl rand -hex 24)
docker compose -f docker-compose.prod.yml up -d --build
```

La app queda en `127.0.0.1:3001` (detrás de nginx) o con HTTPS automático usando `--profile caddy`. Guía completa: [`docs/despliegue.md`](docs/despliegue.md).

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/README.md`](docs/README.md) | Índice, mapa y glosario del dominio |
| [`docs/acceso-y-demo.md`](docs/acceso-y-demo.md) | Usuario `admin`, modo demo, seguridad, cómo pasar a uso real |
| [`docs/pantallas.md`](docs/pantallas.md) | Qué hace cada pantalla y cada formulario |
| [`docs/datos-de-demo.md`](docs/datos-de-demo.md) | Qué datos de ejemplo se cargan y cómo reiniciarlos |
| [`docs/api.md`](docs/api.md) | Todos los endpoints, cuerpos y errores |
| [`docs/base-de-datos.md`](docs/base-de-datos.md) | Tablas, reglas y migraciones |
| [`docs/arquitectura.md`](docs/arquitectura.md) | Estructura de carpetas, stack y variables de entorno |
| [`docs/despliegue.md`](docs/despliegue.md) | Docker, nginx/Caddy, reinicio de la demo, copias de seguridad |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev:all` | BD embebida + API + web en desarrollo |
| `npm run build` | Comprueba tipos y compila la web en `dist/` |
| `npm run db:migrate` | Aplica las migraciones pendientes |
| `npm run db:seed` | Crea los usuarios que falten (sin tocar datos) |
| `npm run demo:reset` | **Borra todo** y recarga la demo (solo con `DEMO_MODE=true`) |
| `npm run test:server` | Pruebas de la API (necesita la BD en marcha) |
