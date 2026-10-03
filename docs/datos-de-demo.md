# Datos de demo

Se cargan **una sola vez**, al arrancar la API con `DEMO_MODE=true` y la tabla `users` vacía (`seedIfEmpty` en `server/src/seed.ts`). Las fechas son relativas a hoy, así que la línea de tiempo siempre se ve viva.

## Contenido

**Usuario:** `admin` (ADMIN, PIN `000000`).

| Cliente | Inicial (cobrada salvo nota) | Otros cobros |
|---|---|---|
| **Acme Café** | 750 USD (Diseño del sitio 600 + Dominio y hosting 150), hace 40 días | Ajustes de menú 120 (cobrado, hace 10 d) · Mantenimiento 60 (pendiente, en 12 d) |
| **Nube Logística** | 1 800 USD (Panel de rastreo), hace 25 días | Serie **Mensualidad 90 × 4**: la 1/4 cobrada, 2/4–4/4 pendientes |
| **Luma Studio** | 2 400 USD (Tienda en línea) **pendiente**, hace 5 días | — |
| **Taller Vega** | *posible cliente* (sin cobros) | — |

| Proyecto | Cliente | Estado | Entrega |
|---|---|---|---|
| Sitio Acme (globe) | Acme Café | activo | en 20 d |
| Panel de rastreo (chart) | Nube Logística | entrega | en 7 d |
| Tienda Luma (cart) | Luma Studio | planeación | en 45 d |

Tareas: 4 (1 completada, 3 pendientes con fecha a 3, 5 y 10 días).
Gastos: Hosting VPS 25 (general) · Licencia de diseño 40 (proyecto Sitio Acme) · Dominio acmecafe.com 14 (cliente Acme Café).

## Reiniciar

```bash
npm run demo:reset                 # local
docker compose -f docker-compose.prod.yml exec app npm run demo:reset   # servidor
```

Hace `TRUNCATE` de todas las tablas de datos y vuelve a cargar la demo. **Borra todo** lo que los visitantes hayan creado. Se niega a ejecutarse si `DEMO_MODE` no es `true`.

## Cambiar los datos de ejemplo

Edita `seedDemoData()` en `server/src/seed.ts` (funciones `client`, `pay`, `item`, `project`, `task`, `expense`) y ejecuta `npm run demo:reset`.
