import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
class Storage { data = new Map(); getItem(k) { return this.data.get(k) ?? null }; setItem(k,v) { this.data.set(k,String(v)) }; removeItem(k) { this.data.delete(k) } }
Object.defineProperty(globalThis, 'localStorage', { value: new Storage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: new Storage(), configurable: true })
const { saveSession, clearSession } = await import('../src/services/session.js')
const { getRevision } = await import('../src/services/datos.js')
const { listarGastos, crearGasto, anularGasto } = await import('../src/services/gastos.js')
const originalFetch = globalThis.fetch
const user = { id: 'admin', nombre: 'Admin', email: 'a@example.com', rol: 'administrador', estado: 'Activo' }
const response = (body, status = 200) => new Response(JSON.stringify(body), { status })
beforeEach(() => { saveSession({ user, token: 'gastos-test', expiresAt: Date.now() + 60000 }); globalThis.fetch = originalFetch })
after(() => { clearSession(); globalThis.fetch = originalFetch })

test('consulta gastos con filtros y paginación en el servidor', async () => {
  globalThis.fetch = async (url, options) => {
    const query = new URL(url)
    assert.equal(query.pathname, '/api/gastos')
    assert.equal(query.searchParams.get('estado'), 'Anulado')
    assert.equal(query.searchParams.get('busqueda'), 'Agua & luz')
    assert.equal(query.searchParams.get('pagina'), '2')
    assert.equal(options.headers.Authorization, 'Bearer gastos-test')
    return response({ ok: true, gastos: [], paginacion: { pagina: 2, paginas: 2, total: 9 } })
  }
  const data = await listarGastos({ estado: 'Anulado', busqueda: 'Agua & luz', pagina: 2, porPagina: 8 })
  assert.deepEqual(data.gastos, [])
  assert.equal(data.paginacion.total, 9)
})

test('registra un gasto real y actualiza las consultas solo tras confirmación', async () => {
  const datos = { concepto: 'Servicio de luz', categoria: 'Servicios', importe: 50000, fecha: '2026-10-29' }
  const revision = getRevision()
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/gastos')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), datos)
    return response({ ok: true, gasto: { id: '12', ...datos, estado: 'Registrado', responsable: 'Admin' } }, 201)
  }
  const gasto = await crearGasto(datos)
  assert.equal(gasto.id, '12')
  assert.equal(gasto.responsable, 'Admin')
  assert.equal(getRevision(), revision + 1)
})

test('anula mediante la API conservando el motivo y el estado de auditoría', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/gastos/12/anulacion')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { motivo: 'Registro duplicado' })
    return response({ ok: true, gasto: { id: '12', estado: 'Anulado', anulacion: { motivo: 'Registro duplicado', responsableId: 'admin' } } })
  }
  const gasto = await anularGasto('12', 'Registro duplicado')
  assert.equal(gasto.estado, 'Anulado')
  assert.equal(gasto.anulacion.motivo, 'Registro duplicado')
})

test('un rechazo de la API no simula registros ni anulación local', async () => {
  const revision = getRevision()
  globalThis.fetch = async () => response({ ok: false, error: 'El gasto ya está anulado.' }, 409)
  await assert.rejects(anularGasto('12', 'Duplicado'), error => error.status === 409 && error.message === 'El gasto ya está anulado.')
  assert.equal(getRevision(), revision)
})
