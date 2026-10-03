# Despliegue

Requisitos: Docker con el plugin Compose. Para HTTPS propio, un dominio apuntando al servidor.

## 1. Configurar
```bash
git clone https://github.com/jorbinogales/hayai-template-space.git && cd hayai-template-space
cp .env.production.example .env
```
Edita `.env`:
- `POSTGRES_PASSWORD`: una clave larga (`openssl rand -hex 24`).
- `DOMAIN`: solo si usas Caddy.
- `DEMO_MODE`: déjalo en `true` para la plantilla (usuario `admin` / `000000`). Ver [acceso-y-demo.md](acceso-y-demo.md).

## 2. Levantar
Dos formas según el servidor:

**a) Servidor con otros sitios (nginx/Apache ya usan 80/443)** — la API queda en `127.0.0.1:3001` y tu proxy apunta a ella:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
Ejemplo de nginx en `deploy/nginx-hayai.conf` (cambia `server_name`; luego `sudo nginx -t && sudo systemctl reload nginx` y `sudo certbot --nginx -d tu.dominio`). Con proxy delante, `TRUST_PROXY=1` ya está activo en el compose.

**b) Servidor libre (80 y 443 abiertos)** — Caddy obtiene el HTTPS solo:
```bash
docker compose -f docker-compose.prod.yml --profile caddy up -d --build
```

Contenedores: `db` (Postgres 16 con volumen `pgdata`, no expuesto), `app` (API + web; aplica migraciones y, con BD vacía, crea el usuario y la demo) y `caddy` (opcional).

## 3. Comprobar
Abre la URL → usuario `admin`, clave `000000`. Si algo falla: `docker compose -f docker-compose.prod.yml logs app`.

## Reiniciar la demo
Borra lo que hayan creado los visitantes y recarga los datos de ejemplo:
```bash
docker compose -f docker-compose.prod.yml exec app npm run demo:reset
```
Para que se haga sola cada noche (cron del servidor):
```
0 4 * * *  cd /ruta/hayai-template-space && docker compose -f docker-compose.prod.yml exec -T app npm run demo:reset
```

## Actualizar
```bash
git pull && docker compose -f docker-compose.prod.yml up -d --build
```

## Copia de seguridad
```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U hayai hayai > backup-$(date +%F).sql
```
Restaurar: `docker compose -f docker-compose.prod.yml exec -T db psql -U hayai hayai < backup.sql`.

## Empezar de cero
`docker compose -f docker-compose.prod.yml down -v` borra también el volumen de la BD; al volver a levantar se recrea todo.

## Problemas frecuentes
| Síntoma | Causa / solución |
|---|---|
| `define POSTGRES_PASSWORD en .env` | Falta el `.env` |
| No puedo iniciar sesión tras cambiar `DEMO_MODE` | La BD ya tenía usuarios; el seed solo corre con BD vacía → `down -v` |
| "Demasiados intentos" | Límite por IP: espera 15 min o sube `LOGIN_IP_MAX` |
| Login funciona pero se pierde la sesión por http | La cookie es `Secure` en producción: usa HTTPS (o `COOKIE_SECURE=false` solo para pruebas) |
| `demo:reset` se niega | `DEMO_MODE` no es `true` |
