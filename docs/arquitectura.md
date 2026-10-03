# Arquitectura

## Stack
- **Web:** React 19 + TypeScript + Vite 8, escena 3D con Three.js.
- **API:** Express 5 + Zod 4 (validación), `pg` (sin ORM), ejecutada con `tsx`. Node ≥ 22.9.
- **BD:** Postgres 16.
- **Producción:** una imagen Docker con la API que sirve también el build de la web (`dist/`); Postgres en su propio contenedor; Caddy opcional.

## Carpetas
```
.
├─ src/                    Frontend (ver pantallas.md)
│  ├─ App.tsx, Cosmos.tsx, world.ts, scene.ts, warp.tsx   escena 3D y navegación
│  ├─ Boot.tsx, Profile.tsx, auth.ts, session.tsx         acceso y sesión
│  ├─ Home/Clients/Projects/Expenses/Finances/Tasks.tsx   pantallas
│  ├─ New*.tsx, EditClient.tsx                            formularios
│  ├─ api.ts, data.ts, cache.ts, store.ts, *Data.ts       acceso a datos y estado
│  └─ styles.css
├─ server/
│  ├─ src/
│  │  ├─ index.ts          arranque (seedIfEmpty + listen)
│  │  ├─ app.ts            middlewares, CSRF, rutas, sirve ../dist
│  │  ├─ auth.ts           PIN scrypt, sesiones, bloqueo, DEMO
│  │  ├─ seed.ts           usuarios iniciales y datos de demo
│  │  ├─ db.ts, util.ts    pool/transacciones, validación y errores
│  │  └─ routes/           auth, users, clients(+payments, prospects), projects, expenses, tasks
│  ├─ db/                  migrate.mjs, dev-db.mjs, migrations/
│  └─ test/api.test.ts     pruebas de integración de la API
├─ deploy/nginx-hayai.conf proxy nginx de ejemplo
├─ Dockerfile, docker-compose.yml (BD local), docker-compose.prod.yml, Caddyfile
└─ docs/
```

## Variables de entorno

| Variable | Por defecto | Efecto |
|---|---|---|
| `DATABASE_URL` | `postgres://hayai:hayai@localhost:54329/hayai` (solo fuera de producción) | Conexión a Postgres |
| `DEMO_MODE` | `false` (en `docker-compose.prod.yml`: `true`) | Modo plantilla, ver [acceso-y-demo.md](acceso-y-demo.md) |
| `PORT` | `3001` | Puerto de la API |
| `NODE_ENV` | — | `production`: cookie `Secure` y sirve `dist/` |
| `COOKIE_SECURE` | según `NODE_ENV` | `false` para probar un build de producción por http local |
| `TRUST_PROXY` | — | `1` si hay proxy delante (para el límite por IP) |
| `LOGIN_IP_MAX` | `30` | Intentos de login por IP cada 15 min |
| `POSTGRES_PASSWORD` | obligatoria en prod | Clave de Postgres (compose) |
| `DOMAIN` | `localhost` | Dominio para Caddy |

## Decisiones a conocer
- Los datos se cargan completos tras el login (`loadAll`) y se mantienen en memoria; cada operación actualiza el servidor y la copia local.
- El borrado de clientes/proyectos es explícito y transaccional (los gastos y cobros son `RESTRICT` en el esquema).
- El límite de intentos por IP vive en memoria: con varias instancias de la API habría que moverlo a la BD.
