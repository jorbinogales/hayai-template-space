# Base de datos

Postgres 16. Esquema en `server/db/migrations/` (SQL plano, aplicado en orden por `server/db/migrate.mjs`, que las registra en `schema_migrations` con su checksum). **Nunca edites una migración ya aplicada**: crea `005_*.sql`. En Docker se aplican solas al arrancar `app`.

Convenciones: PK `uuid`, dinero `numeric(14,2) > 0`, dominios con `CHECK` (no enums), `timestamptz`, fechas de negocio como `date`, `updated_at` por trigger. Lo contable **no** se borra en cascada en el esquema (`ON DELETE RESTRICT`); el borrado de clientes/proyectos lo hace la API de forma explícita y transaccional.

## Tablas

| Tabla | Para qué | Claves y reglas |
|---|---|---|
| `users` | Astronautas/socios | `name` único sin distinguir mayúsculas · `role` `ADMIN`/`SOCIO` · `pin_hash` (scrypt) · `must_change_pin` · `active` · `failed_attempts`, `locked_until` |
| `sessions` | Sesiones | Solo `token_hash` (SHA-256) · `expires_at` · cascada con el usuario |
| `clients` | Clientes y posibles clientes | `is_prospect` (004) · `created_by` → users |
| `client_items` | Desglose de la inicial | Cascada con el cliente · `amount > 0` |
| `payments` | Cobros del cliente | `kind` `inicial`/`pago` · `status` `cobrado`/`pendiente` · **una inicial por cliente** (índice único parcial) · serie mensual: `series_id`, `series_index`, `series_total` (2–36) con único `(series_id, series_index)` |
| `projects` | Proyectos | `icon` (7 valores) · `status` `activo`/`entrega`/`planeacion` · `owner_id` (responsable) · `due_date` |
| `expenses` | Gastos | `category` (6 valores) · `scope` `general`/`cliente`/`proyecto` con CHECK que obliga a `client_id`/`project_id` según el ámbito |
| `tasks` | Tareas de proyecto | Cascada con el proyecto · `done`/`done_at` coherentes · `due_date` (004) |
| `schema_migrations` | Registro de migraciones | `name`, `checksum`, `applied_at` |

## Relaciones
```
users ─┬─< sessions
       ├─< clients ─┬─< client_items
       │            ├─< payments
       │            ├─< projects ─< tasks
       │            └─< expenses (ámbito cliente)
       └─ projects.owner_id / created_by
projects ─< expenses (ámbito proyecto)
```

## Migraciones

| # | Cambio |
|---|---|
| 001_init | Esquema base completo |
| 002_payment_series | Pagos mensuales recurrentes (columnas `series_*`) |
| 003_drop_expense_status | Los gastos ya no tienen estado (dinero que ya salió) |
| 004_prospects_task_due | `clients.is_prospect` y `tasks.due_date` |

## Índices relevantes
`payments_pending_date_idx` (próximos cobros), `payments_client_date_idx` (historial), `tasks_due_open_idx` (agenda), `expenses_date_idx`, `users_name_lower_uq`.

## Base de datos local
```bash
npm run db:dev        # Postgres embebido (sin Docker) en :54329; deja la terminal abierta
npm run db:migrate
```
Alternativa con Docker: `docker compose up -d` (mismo puerto y credenciales; no corras ambos). Reiniciar de cero: borra `server/.pgdata` (embebida) o `docker compose down -v`.
