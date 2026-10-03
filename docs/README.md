# Documentación de HAYAI Space (plantilla)

HAYAI Space es el sistema interno de HAYAI para controlar **clientes, proyectos, cobros, gastos, finanzas y tareas**. Esta plantilla es la misma aplicación pero preparada para mostrarse: usuario `admin` y datos de ejemplo.

## Mapa

| Quiero… | Leer |
|---|---|
| Entrar y entender el usuario `admin` | [acceso-y-demo.md](acceso-y-demo.md) |
| Saber qué hace cada pantalla | [pantallas.md](pantallas.md) |
| Ver qué datos trae la demo / reiniciarlos | [datos-de-demo.md](datos-de-demo.md) |
| Integrar o probar la API | [api.md](api.md) |
| Entender las tablas y reglas de negocio | [base-de-datos.md](base-de-datos.md) |
| Moverme por el código | [arquitectura.md](arquitectura.md) |
| Desplegarla en un servidor | [despliegue.md](despliegue.md) |

## Conceptos del dominio

| Término | Significado |
|---|---|
| **Astronauta / socio** | Usuario del sistema. En la demo solo existe `admin`. |
| **Cliente** | Empresa o persona a la que HAYAI le desarrolla un sistema. |
| **Posible cliente (prospecto)** | Cliente que aún no firmó: sin cobros; tiene un proyecto en "planeación" y una visita agendada. |
| **Inicial** | Primer pago del cliente, desglosado en conceptos (ítems). Solo una por cliente. |
| **Pago / cobro** | Dinero que el cliente paga o debe pagar. Estado `cobrado` o `pendiente`. |
| **Pago mensual (serie)** | Un pago que se repite de 2 a 36 meses, el mismo día de cada mes. Se guarda como N filas. |
| **Proyecto** | Sistema que se construye para un cliente. Estados: `planeacion` ("Por visitar"), `activo`, `entrega`. |
| **Tarea** | Pendiente de un proyecto; puede tener fecha (agenda). |
| **Gasto** | Dinero que ya salió. Se imputa a HAYAI (general), a un cliente o a un proyecto. |
| **Finanzas** | Lo cobrado por cliente frente a los gastos imputados, por periodo. |

Moneda: todo se guarda en USD (`numeric(14,2)`).
