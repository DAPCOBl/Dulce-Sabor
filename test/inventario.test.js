import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'

class Storage {
  data = new Map()
  getItem(key) { return this.data.get(key) ?? null }
  setItem(key, value) { this.data.set(key, String(value)) }
  removeItem(key) { this.data.delete(key) }
}
Object.defineProperty(globalThis, 'localStorage', { value: new Storage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: new Storage(), configurable: true })
const { saveSession, clearSession } = await import('../src/services/session.js')
const { getRevision } = await import('../src/services/datos.js')
const { movimientoPendiente, registrarMovimiento, obtenerInventario } = await import('../src/services/inventario.js')
const originalFetch = globalThis.fetch
const response = (body, status = 200) => new Response(JSON.stringify(body), { status })
const body = () => ({ productoId: 'p13', cantidad: 12, tipo: 'entrada', motivo: 'Proveedor' })
let user
let numero = 0
beforeEach(() => {
  user = { id: `inventario-admin-${++numero}`, nombre: 'Admin', email: 'admin@example.com', rol: 'administrador', estado: 'Activo' }
  saveSession({ user, token: 'inventario-test', expiresAt: Date.now() + 60000 })
  globalThis.fetch = originalFetch
})
after(() => { clearSession(); globalThis.fetch = originalFetch })

test('mantiene la clave al perder respuesta y devuelve el movimiento original junto al stock actual', async () => {
  let clave
  const revision = getRevision()
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/inventario/movimientos')
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, 'Bearer inventario-test')
    assert.deepEqual(JSON.parse(options.body), body())
    clave = options.headers['Idempotency-Key']
    assert.match(clave, /^[A-Za-z0-9_-]{8,128}$/)
    throw new TypeError('Respuesta perdida')
  }
  await assert.rejects(registrarMovimiento(body()), /No se pudo conectar/)
  assert.equal(movimientoPendiente().key, clave)
  assert.equal(getRevision(), revision)
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers['Idempotency-Key'], clave)
    return response({ ok: true, movimiento: { id: 'mov-1', saldo: 15, cambio: 12 }, producto: { id: 'p13', stock: 13 }, repetida: true })
  }
  const movimiento = await registrarMovimiento(body())
  assert.equal(movimiento.id, 'mov-1')
  assert.equal(movimiento.saldo, 15)
  assert.equal(movimiento.productoActual.stock, 13)
  assert.equal(movimientoPendiente(), null)
  assert.equal(getRevision(), revision + 1)
  assert.equal(sessionStorage.getItem(`dulcesabor:movimiento:${user.id}`), null)
})

test('restaura el intento desde sessionStorage y reutiliza su clave después de recargar el módulo', async () => {
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await assert.rejects(registrarMovimiento(body()))
  const pendiente = movimientoPendiente()
  const recargado = await import('../src/services/inventario.js?recarga-pendiente')
  assert.deepEqual(recargado.movimientoPendiente(), pendiente)
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers['Idempotency-Key'], pendiente.key)
    assert.deepEqual(JSON.parse(options.body), pendiente.body)
    return response({ ok: true, movimiento: { id: 'mov-1' }, producto: { id: 'p13', stock: 15 } })
  }
  const movimiento = await recargado.registrarMovimiento({ motivo: 'Proveedor', tipo: 'entrada', cantidad: 12, productoId: 'p13' })
  assert.equal(movimiento.id, 'mov-1')
  assert.equal(recargado.movimientoPendiente(), null)
})

test('no reemplaza el movimiento pendiente con una carga distinta', async () => {
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await assert.rejects(registrarMovimiento(body()))
  const pendiente = movimientoPendiente()
  let solicitudes = 0
  globalThis.fetch = async () => { solicitudes++; return response({ ok: true }) }
  await assert.rejects(registrarMovimiento({ ...body(), cantidad: 5 }), error => error.status === 409 && /pendiente/.test(error.message))
  assert.equal(solicitudes, 0)
  assert.deepEqual(movimientoPendiente(), pendiente)
})

test('los rechazos definitivos limpian el borrador y no invalidan datos como si hubiera éxito', async () => {
  for (const status of [400, 404, 409, 413, 422]) {
    globalThis.fetch = async () => { throw new TypeError('Offline') }
    await assert.rejects(registrarMovimiento(body()))
    const revision = getRevision()
    globalThis.fetch = async () => response({ ok: false, error: 'Solicitud rechazada.' }, status)
    await assert.rejects(registrarMovimiento(body()), error => error.status === status)
    assert.equal(movimientoPendiente(), null)
    assert.equal(getRevision(), revision)
  }
})

test('un 408, un error de servidor o una sesión vencida conservan la clave para verificar el resultado', async () => {
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await assert.rejects(registrarMovimiento(body()))
  const clave = movimientoPendiente().key
  for (const status of [408, 500, 503, 401]) {
    globalThis.fetch = async () => response({ ok: false, error: 'No confirmado.' }, status)
    await assert.rejects(registrarMovimiento(body()), error => error.status === status)
    if (status === 401) saveSession({ user, token: 'sesion-renovada', expiresAt: Date.now() + 60000 })
    assert.equal(movimientoPendiente().key, clave)
  }
})

test('valida el cuerpo antes de guardar y mantiene los pendientes separados por usuario', async () => {
  let solicitudes = 0
  globalThis.fetch = async () => { solicitudes++; throw new TypeError('Offline') }
  for (const datos of [null, [], { ...body(), cantidad: 0 }, { ...body(), cantidad: '12' }, { ...body(), cantidad: 1.5 }, { ...body(), productoId: '' }]) {
    await assert.rejects(registrarMovimiento(datos), error => error.status === 400)
  }
  assert.equal(solicitudes, 0)
  assert.equal(movimientoPendiente(), null)
  await assert.rejects(registrarMovimiento(body()))
  const clave = movimientoPendiente().key
  saveSession({ user: { ...user, id: 'otro-admin' }, token: 'otra-sesion', expiresAt: Date.now() + 60000 })
  assert.equal(movimientoPendiente(), null)
  saveSession({ user, token: 'inventario-test', expiresAt: Date.now() + 60000 })
  assert.equal(movimientoPendiente().key, clave)
})

test('una confirmación tardía del intento anterior no borra un movimiento posterior', async () => {
  const resolver = []
  globalThis.fetch = async () => new Promise(resolve => resolver.push(resolve))
  const primero = registrarMovimiento(body())
  const repetido = registrarMovimiento(body())
  resolver[0](response({ ok: true, movimiento: { id: 'mov-1' }, producto: { id: 'p13', stock: 15 } }))
  await primero
  const posterior = registrarMovimiento({ ...body(), cantidad: 3 })
  const nuevaClave = movimientoPendiente().key
  resolver[1](response({ ok: true, movimiento: { id: 'mov-1' }, producto: { id: 'p13', stock: 15 } }))
  await repetido
  assert.equal(movimientoPendiente().key, nuevaClave)
  resolver[2](response({ ok: true, movimiento: { id: 'mov-2' }, producto: { id: 'p13', stock: 18 } }))
  await posterior
  assert.equal(movimientoPendiente(), null)
})

test('obtiene una existencia fresca por ID mediante la API', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/api/inventario/p13')
    assert.equal(options.headers.Authorization, 'Bearer inventario-test')
    return response({ ok: true, producto: { id: 'p13', stock: 7 } })
  }
  assert.equal((await obtenerInventario('p13')).producto.stock, 7)
})
