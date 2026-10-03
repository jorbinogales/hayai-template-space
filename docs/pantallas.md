# Pantallas

La app es **una sola escena 3D** (`src/Cosmos.tsx`, `src/world.ts`): cada pantalla es una capa HTML sobre el mismo canvas y navegar mueve la cámara entre planetas con un efecto de velocidad luz (`src/warp.tsx`). La ruta vive en el hash de la URL (`#clientes`, `#proyectos`, `#gastos`, `#finanzas`, `#tareas`; vacío = Home).

Con `prefers-reduced-motion` las animaciones se acortan.

## Acceso — `Boot.tsx`
Arranque de sistemas → nombre → PIN de 6 casillas (admite pegar, flechas y borrar). Ver [acceso-y-demo.md](acceso-y-demo.md). Errores: clave incorrecta, demasiados intentos (429), cuenta bloqueada (423), servidor caído.

## Barra superior y perfil — `ui.tsx` (Topbar), `Profile.tsx`
Muestra al astronauta con su avatar. Desde ahí: **Perfil** (cambiar clave; en demo responde "En la demo no se puede cambiar la clave de admin") y **Cerrar sesión**.

## Home — `Home.tsx`
Núcleo central con cinco planetas-tarjeta que resumen cada área (clientes, proyectos, gastos, finanzas, tareas), incluidos los ingresos y gastos del mes (`finance.ts`). Clic en un planeta = viaje a su pantalla. También abre el **calendario general** (`CalendarModal.tsx`) y la **línea de tiempo por días** (`DayTrack.tsx`: 30 días seguidos con cobros pendientes y tareas agendadas, con o sin eventos).

## Clientes — `Clients.tsx`
Cada cliente es un nodo junto al planeta; al elegirlo aparece su tarjeta con total, cobrado y pendiente.
- **Nuevo cliente** (`NewClient.tsx`): nombre, avatar, fecha y desglose de la inicial en ítems (concepto + monto), y cobros adicionales con fecha. Un cobro puede **repetirse de 2 a 36 meses** (pago mensual: mismo día cada mes, recortado al último día si el mes es corto). Los recurrentes nacen pendientes.
- **Nuevo posible cliente** (`NewProspect.tsx`): nombre, su posible proyecto (nombre, icono, responsable, fecha) y una visita agendada (se crea como tarea con fecha). Sin pagos.
- **Historial** (`History.tsx`): cajón lateral con la inicial desglosada y todos los movimientos por fecha ("Pago mensual 3/12").
- **Editar cliente** (`EditClient.tsx`): nombre y avatar, la inicial (ítems y fecha) y cada cuota/cobro (fecha, concepto, monto, estado; borrar es inmediato). Se guarda al salir del campo.
- **Convertir** un posible cliente en cliente.
- **Eliminar** cliente: borrado en cascada (proyectos, tareas, gastos, cobros e ítems), con confirmación.
- **Calendario** (`Calendar.tsx`): vista de mes o de año con los movimientos de cada día; arrastrable y con flechas.

## Proyectos — `Projects.tsx`, `NewProject.tsx`
Lista de proyectos con icono, cliente, responsable, estado (Por visitar / Activo / Entrega) y fecha de entrega. Crear (nombre, icono, cliente, responsable, estado, entrega), editar todos los campos y eliminar (borra sus tareas y gastos).
Iconos disponibles: `globe`, `phone`, `chart`, `cart`, `palette`, `box`, `code`.

## Gastos — `Expenses.tsx`, `NewExpense.tsx`
Calendario de gastos del mes (o del año) y histórico en línea de tiempo.
Alta de gasto: concepto, monto, fecha, categoría (`Herramientas`, `Infraestructura`, `Operación`, `Marketing`, `Equipos`, `Otros`) e imputación: **HAYAI** (general), **cliente** o **proyecto**. Los gastos solo se crean o eliminan (no hay edición).

## Finanzas — `Finances.tsx`, `finance.ts`
Dashboard por periodo: lo **cobrado por cada cliente** frente a los **gastos imputados** (directos o por sus proyectos) y el resultado por cliente y total de HAYAI.

## Tareas — `Tasks.tsx`
Tablero "Por hacer / Completadas" por proyecto. Crear tarea (título, fecha opcional), marcar hecha/pendiente (cambio instantáneo; se revierte si el servidor falla), cambiar o quitar la fecha y eliminar. Las tareas con fecha alimentan la línea de tiempo del Home.

## Cómo viaja el dato en el front
`api.ts` (fetch + `ApiError`; un 401 emite `hayai:unauthorized` y vuelve al acceso) → `data.ts` (`loadAll` tras el login, `resetAll` al salir) → `cache.ts` (listas en memoria con suscripción) → `store.ts`, `projectData.ts`, `taskData.ts`, `expenseData.ts` (operaciones por área) → componentes.
