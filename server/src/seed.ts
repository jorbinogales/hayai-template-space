import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { DEMO, hashPin, INITIAL_PIN } from './auth.ts'
import { pool, tx } from './db.ts'

const PARTNERS = [
  { name: 'Elis', avatar: 'nova' },
  { name: 'Jorbi', avatar: 'orion' },
  { name: 'Leandro', avatar: 'vega' },
]

const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10)

/**
 * Idempotente: crea solo los usuarios que falten (nunca toca PIN ni datos de los existentes).
 * DEMO_MODE=true (plantilla): un solo usuario `admin`, PIN 000000, sin cambio obligatorio.
 */
export async function seed(): Promise<number> {
  let created = 0
  const users = DEMO ? [{ name: 'admin', avatar: 'nova', role: 'ADMIN' }] : PARTNERS.map((p) => ({ ...p, role: 'SOCIO' }))
  for (const p of users) {
    const { rowCount } = await pool.query(
      `INSERT INTO users (name, avatar, role, pin_hash, must_change_pin, active)
       VALUES ($1, $2, $3, $4, $5, true) ON CONFLICT DO NOTHING`,
      [p.name, p.avatar, p.role, await hashPin(INITIAL_PIN), !DEMO],
    )
    created += rowCount ?? 0
  }
  return created
}

/** Datos de ejemplo (solo DEMO_MODE): 3 clientes + 1 posible cliente, proyectos, cobros, un pago mensual, gastos y tareas. Fechas relativas a hoy. */
export async function seedDemoData() {
  await tx(async (c) => {
    const uid = (await c.query(`SELECT id FROM users WHERE lower(name) = 'admin'`)).rows[0].id
    const client = async (name: string, avatar: string, prospect = false) =>
      (await c.query('INSERT INTO clients (name, avatar, is_prospect, created_by) VALUES ($1,$2,$3,$4) RETURNING id', [name, avatar, prospect, uid])).rows[0].id as string
    const pay = (cid: string, date: string, concept: string, amount: number, kind: string, status: string, series?: [string, number, number]) =>
      c.query(
        `INSERT INTO payments (client_id, date, concept, amount, kind, status, created_by, series_id, series_index, series_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [cid, date, concept, amount, kind, status, uid, series?.[0] ?? null, series?.[1] ?? null, series?.[2] ?? null],
      )
    const item = (cid: string, concept: string, amount: number) =>
      c.query('INSERT INTO client_items (client_id, concept, amount) VALUES ($1,$2,$3)', [cid, concept, amount])
    const project = async (name: string, icon: string, cid: string, status: string, due: string) =>
      (await c.query('INSERT INTO projects (name, icon, client_id, owner_id, status, due_date, created_by) VALUES ($1,$2,$3,$4,$5,$6,$4) RETURNING id', [name, icon, cid, uid, status, due])).rows[0].id as string
    const task = (pid: string, title: string, done: boolean, due: string | null) =>
      c.query('INSERT INTO tasks (project_id, title, done, done_at, due_date, created_by) VALUES ($1,$2,$3,$4,$5,$6)', [pid, title, done, done ? new Date() : null, due, uid])
    const expense = (date: string, concept: string, amount: number, category: string, scope: string, client: string | null, proj: string | null) =>
      c.query('INSERT INTO expenses (date, concept, amount, category, scope, client_id, project_id, created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [date, concept, amount, category, scope, client, proj, uid])

    const acme = await client('Acme Café', 'orion')
    await item(acme, 'Diseño del sitio', 600)
    await item(acme, 'Dominio y hosting (año 1)', 150)
    await pay(acme, day(-40), 'Inicial', 750, 'inicial', 'cobrado')
    await pay(acme, day(-10), 'Ajustes de menú', 120, 'pago', 'cobrado')
    await pay(acme, day(12), 'Mantenimiento', 60, 'pago', 'pendiente')

    const nube = await client('Nube Logística', 'vega')
    await item(nube, 'Panel de rastreo', 1800)
    await pay(nube, day(-25), 'Inicial', 1800, 'inicial', 'cobrado')
    const sid = randomUUID()
    for (let i = 0; i < 4; i++) await pay(nube, day(-25 + 30 * i), 'Mensualidad', 90, 'pago', i === 0 ? 'cobrado' : 'pendiente', [sid, i + 1, 4])

    const luma = await client('Luma Studio', 'nova')
    await item(luma, 'Tienda en línea', 2400)
    await pay(luma, day(-5), 'Inicial', 2400, 'inicial', 'pendiente')

    await client('Taller Vega', 'orion', true)

    const web = await project('Sitio Acme', 'globe', acme, 'activo', day(20))
    const panel = await project('Panel de rastreo', 'chart', nube, 'entrega', day(7))
    const shop = await project('Tienda Luma', 'cart', luma, 'planeacion', day(45))
    await task(web, 'Publicar el menú del día', true, null)
    await task(web, 'Conectar formulario de reservas', false, day(3))
    await task(panel, 'Revisión final con el cliente', false, day(5))
    await task(shop, 'Elegir pasarela de pago', false, day(10))

    await expense(day(-30), 'Hosting VPS', 25, 'Infraestructura', 'general', null, null)
    await expense(day(-12), 'Licencia de diseño', 40, 'Herramientas', 'proyecto', null, web)
    await expense(day(-3), 'Dominio acmecafe.com', 14, 'Infraestructura', 'cliente', acme, null)
  })
}

export async function seedIfEmpty() {
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM users')
  if (rows[0].n > 0) return
  console.log(`seed: ${await seed()} usuarios creados (PIN inicial ${INITIAL_PIN})`)
  if (DEMO) {
    await seedDemoData()
    console.log('seed: datos de demo cargados')
  }
}

// npm run db:seed  |  npm run demo:reset  (borra TODO y vuelve a cargar la demo)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (process.argv.includes('--reset')) {
      if (!DEMO) throw new Error('--reset solo funciona con DEMO_MODE=true (borra TODOS los datos)')
      await pool.query('TRUNCATE users, clients, projects, expenses, tasks, payments, client_items, sessions CASCADE')
      await seedIfEmpty()
    } else console.log(`seed: ${await seed()} usuarios creados`)
  } finally {
    await pool.end()
  }
}
