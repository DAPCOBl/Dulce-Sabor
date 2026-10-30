import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
class Storage { data = new Map(); getItem(k) { return this.data.get(k) ?? null }; setItem(k,v) { this.data.set(k,String(v)) }; removeItem(k) { this.data.delete(k) } }
Object.defineProperty(globalThis, 'localStorage', { value: new Storage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: new Storage(), configurable: true })
const { saveSession, clearSession } = await import('../src/services/session.js')
const { listarTodo, consulta, getRevision } = await import('../src/services/datos.js')
const { crearUsuario, actualizarUsuario, alternarEstadoUsuario, listarUsuarios } = await import('../src/services/usuarios.js')
const { cobrarVenta, cobroPendiente } = await import('../src/services/ventas.js')
const originalFetch = globalThis.fetch
const user = { id: 'admin', nombre: 'Admin', email: 'a@example.com', rol: 'administrador', estado: 'Activo' }
const response = (body, status = 200) => new Response(JSON.stringify(body), { status })
beforeEach(() => { saveSession({ user, token: 'test', expiresAt: Date.now() + 60000 }); globalThis.fetch = originalFetch })
after(() => { clearSession(); globalThis.fetch = originalFetch })
test('codifica filtros y no manda campos vacíos', () => {
  assert.equal(consulta({ busqueda: 'Pan & café', estado: '', pagina: 2 }), '?busqueda=Pan+%26+caf%C3%A9&pagina=2')
})
test('recorre todas las páginas del servidor y elimina duplicados por ID', async () => {
  globalThis.fetch = async url => {
    const pagina = Number(new URL(url).searchParams.get('pagina'))
    return response({ ok: true, productos: pagina === 1 ? [{ id: 'a' }, { id: 'b' }] : [{ id: 'b' }, { id: 'c' }], paginacion: { pagina, paginas: 2 } })
  }
  assert.deepEqual((await listarTodo('/productos', 'productos')).map(p => p.id), ['a', 'b', 'c'])
})
test('crear y editar usuarios esperan confirmación real antes de invalidar datos', async () => {
  const revision = getRevision()
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer test')
    assert.ok(['POST', 'PATCH'].includes(options.method))
    return response({ ok: true, user })
  }
  assert.equal((await crearUsuario({ nombre: 'Admin' })).id, 'admin')
  assert.equal((await actualizarUsuario('admin', { nombre: 'Admin' })).id, 'admin')
  assert.equal(getRevision(), revision + 2)
})
test('errores de reglas del servidor se conservan sin simular cambios locales', async () => {
  const revision = getRevision()
  globalThis.fetch = async () => response({ ok: false, error: 'Último administrador activo.' }, 409)
  await assert.rejects(alternarEstadoUsuario(user), /Último administrador/)
  assert.equal(getRevision(), revision)
  globalThis.fetch = async url => { assert.match(url, /rol=cajero/); return response({ ok: true, usuarios: [], paginacion: { total: 0 } }) }
  assert.deepEqual((await listarUsuarios({ rol: 'cajero' })).usuarios, [])
})

test('un cobro incierto conserva la clave y se confirma con el mismo reintento', async () => {
  const body = { items: [{ id: 'p3', cantidad: 1 }], metodo: 'tarjeta' }
  let clave
  globalThis.fetch = async (url, options) => { clave = options.headers['Idempotency-Key']; throw new TypeError('Conexión perdida') }
  await assert.rejects(cobrarVenta('cashier-test', body, [{ id: 'p3', precio: 2500, cantidad: 1 }]))
  assert.equal(cobroPendiente('cashier-test').key, clave)
  const recargado = await import('../src/services/ventas.js?recarga')
  assert.equal(recargado.cobroPendiente('cashier-test').key, clave)
  globalThis.fetch = async (url, options) => { assert.equal(options.headers['Idempotency-Key'], clave); return response({ ok: true, venta: { id: '1', importe: 2500 }, repetida: true }) }
  const venta = await cobrarVenta('cashier-test', body, [])
  assert.equal(venta.id, '1'); assert.equal(cobroPendiente('cashier-test'), null)
})
test('no permite cambiar un cobro incierto y conserva el error de validación definitivo', async () => {
  const body = { items: [{ id: 'p3', cantidad: 1 }], metodo: 'tarjeta' }
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await assert.rejects(cobrarVenta('cashier-other', body, []))
  await assert.rejects(cobrarVenta('cashier-other', { ...body, items: [{ id: 'p3', cantidad: 2 }] }, []), /cobro pendiente/)
  globalThis.fetch = async () => response({ ok: false, error: 'Stock insuficiente.' }, 409)
  await assert.rejects(cobrarVenta('cashier-other', body, []), /Stock insuficiente/)
  assert.equal(cobroPendiente('cashier-other'), null)
})
