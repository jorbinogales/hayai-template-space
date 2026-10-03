# Acceso y modo demo

## Credenciales por defecto

| Campo | Valor |
|---|---|
| Usuario | `admin` (no distingue mayúsculas) |
| Clave (PIN) | `000000` |
| Rol | `ADMIN` |

El acceso es por **nombre + PIN de 6 dígitos** (no hay correo ni contraseña larga). Flujo en pantalla (`src/Boot.tsx`):

1. Arranque de sistemas (animación).
2. Escribes el nombre → el servidor responde si existe (`POST /api/auth/lookup`) y muestra su avatar.
3. Escribes el PIN → `POST /api/auth/login`. La sesión queda en una cookie `hayai_sid` (HttpOnly, 7 días).

En la pantalla de acceso aparece el recordatorio "Demo: usuario admin · clave 000000".

## `DEMO_MODE`

Variable de entorno que convierte la instalación en plantilla.

| | `DEMO_MODE=true` (plantilla) | `DEMO_MODE=false` / sin definir (uso real) |
|---|---|---|
| Usuarios creados en BD vacía | solo `admin` (rol `ADMIN`) | `Elis`, `Jorbi`, `Leandro` (rol `SOCIO`) |
| PIN inicial | `000000`, **sin** obligar a cambiarlo | `000000`, **obliga** a crear uno nuevo al entrar |
| Datos de ejemplo | sí (ver [datos-de-demo.md](datos-de-demo.md)) | ninguno |
| Cambiar la clave (`POST /api/auth/change-pin`) | bloqueado (`403`) | permitido |
| Bloqueo por 5 intentos fallidos | desactivado (nadie puede dejar fuera a `admin`) | 15 min de bloqueo |
| `npm run demo:reset` | disponible | se niega a ejecutarse |

`docker-compose.prod.yml` pasa `DEMO_MODE=${DEMO_MODE:-true}`: **esta plantilla arranca en demo salvo que lo cambies** en `.env`.

## Seguridad que sigue activa en la demo

- Límite de intentos por IP: 30 logins cada 15 min (`LOGIN_IP_MAX`).
- Cookie de sesión `HttpOnly`, `SameSite=Lax`, `Secure` en producción; en BD solo se guarda el hash SHA-256 del token.
- PIN almacenado con scrypt (nunca en claro).
- Protección CSRF básica: el `Origin` debe coincidir con el host y los cuerpos deben ser JSON.
- Cabeceras `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy: no-referrer`.

> La demo es **pública por diseño**: cualquiera con la URL entra como `admin` y puede crear/borrar datos. No guardes información real en ella. Reinicia los datos con `npm run demo:reset` (ver [despliegue.md](despliegue.md#reiniciar-la-demo)).

## Pasar de plantilla a uso real

1. Haz una copia si hace falta (ver [despliegue.md](despliegue.md#copia-de-seguridad)).
2. En `.env` pon `DEMO_MODE=false`.
3. Vacía la BD (`docker compose -f docker-compose.prod.yml down -v`) y levanta de nuevo: se crean los 3 socios con PIN `000000`, que el sistema obliga a cambiar al primer ingreso.
4. Para usar otros nombres de socios, edita `PARTNERS` en `server/src/seed.ts` antes de arrancar con BD vacía.

> Si dejas `DEMO_MODE=false` sobre una BD que ya tiene `admin`, ese usuario sigue existiendo con PIN `000000` y sin cambio obligatorio. Elimínalo o vacía la BD.
