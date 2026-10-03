# API

Base: `/api`. JSON en ambos sentidos. Fechas `AAAA-MM-DD`, dinero como número con máximo 2 decimales (`0 < monto ≤ 1 000 000 000`), ids `uuid`. Mensajes de error en español.

**Autenticación:** cookie `hayai_sid` (la fija `POST /auth/login`). Todo lo que no sea `/auth/login` y `/auth/lookup` exige sesión. Los métodos de escritura exigen `Content-Type: application/json` y, si viene `Origin`, que coincida con el host.

**Errores:** `{ "error": "mensaje" }` con `400` datos inválidos · `401` sin sesión / login incorrecto · `403` prohibido · `404` no existe · `409` conflicto con datos existentes · `413` cuerpo > 100 kb · `415` no es JSON · `423` cuenta bloqueada (`retryAfter` en segundos) · `429` demasiados intentos · `500`.

## Auth — `/api/auth`

| Método y ruta | Cuerpo | Respuesta |
|---|---|---|
| `POST /lookup` | `{ name }` | `{ name, avatar }` o `404` |
| `POST /login` | `{ name, pin }` (`pin`: 6 dígitos) | Sesión `{ id, name, avatar, role, mustChangePin }` + cookie |
| `GET /me` | — | Sesión actual |
| `POST /logout` | — | `204` |
| `POST /change-pin` | `{ currentPin, newPin }` | Sesión. `newPin` ≠ actual y ≠ `000000`. **`403` siempre en demo.** |

## Usuarios — `/api/users`
`GET /` → `[{ id, name, avatar }]` de los usuarios activos.

## Clientes — `/api/clients`

Cliente: `{ id, name, avatar, prospect, items: [{id, concept, amount}], movements: [{id, date, concept, amount, kind, status, series}] }`. `kind`: `inicial` | `pago`. `status`: `cobrado` | `pendiente`. `series`: `null` o `{ id, index, total }`.

| Método y ruta | Cuerpo | Notas |
|---|---|---|
| `GET /` | — | Todos los clientes |
| `POST /` | `{ name, avatar, initialDate, items: [{concept, amount}], charges: [{date, amount, concept, repeatMonths?}] }` | `201`. La inicial = suma de `items` (cobrada). `repeatMonths` 2–36 crea una serie pendiente. Máx. 50 ítems, 100 cobros |
| `PATCH /:id` | `{ name?, avatar? }` | Al menos uno |
| `DELETE /:id` | — | `204`. Cascada: proyectos, tareas, gastos, cobros, ítems |
| `PUT /:id/initial` | `{ date, items }` | Reemplaza el desglose y sincroniza la inicial (la crea, actualiza o borra según la suma) |
| `POST /:id/payments` | `{ date, amount, concept, status? = pendiente, repeatMonths? }` | `201` devuelve el cliente. Recurrente ⇒ `status` debe ser `pendiente` |
| `POST /:id/convert` | — | Posible cliente → cliente. `409` si ya no lo es |

## Cobros — `/api/payments`
| Método y ruta | Cuerpo | Notas |
|---|---|---|
| `PATCH /:id` | `{ date?, amount?, concept?, status? }` | Al menos uno. `400` si es la inicial (se edita con `PUT /clients/:id/initial`). Devuelve el cliente |
| `DELETE /:id` | — | Borra el cobro |

## Posibles clientes — `/api/prospects`
`POST /` `{ name, avatar?, project: { name, icon, owner, due? }, visit?: { date?, title? } }` → `201 { client, project, task }`. `owner` es el nombre de un usuario activo.

## Proyectos — `/api/projects`
Proyecto: `{ id, name, icon, owner, client, clientId, status, due }`.

| Método y ruta | Cuerpo |
|---|---|
| `GET /` | — |
| `POST /` | `{ name, icon, clientId, owner, status? = planeacion, due? }` → `201` |
| `PATCH /:id` | Cualquiera de `name, icon, clientId, owner, status, due` (`due: null` borra la fecha) |
| `DELETE /:id` | `204`; borra también sus tareas y gastos |

`icon`: `globe phone chart cart palette box code`. `status`: `activo` · `entrega` · `planeacion`.

## Gastos — `/api/expenses`
Gasto: `{ id, date, concept, amount, category, scope, ref, refId, owner }`.
- `GET /` — más recientes primero.
- `POST /` `{ date, concept, amount, category, scope, refId? }` → `201`. `scope`: `general` (sin `refId`) | `cliente` | `proyecto` (`refId` obligatorio). `category`: `Herramientas`, `Infraestructura`, `Operación`, `Marketing`, `Equipos`, `Otros`.
- `DELETE /:id` — `204`.

## Tareas — `/api/tasks`
Tarea: `{ id, projectId, title, done, due, owner }`.
- `GET /`
- `POST /` `{ projectId, title, due? }` → `201`
- `PATCH /:id` `{ done?, due? }` (al menos uno; `due: null` quita la fecha)
- `DELETE /:id` — `204`

## Ejemplo con curl
```bash
curl -c cj -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' -d '{"name":"admin","pin":"000000"}'
curl -b cj http://localhost:3001/api/clients
```

Las pruebas de integración de todo lo anterior están en `server/test/api.test.ts` (`npm run test:server`).
