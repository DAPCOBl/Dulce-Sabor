import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { saveSession, clearSession } from '../src/services/session.js'
import { listarTodo, consulta, getRevision } from '../src/services/datos.js'
import { crearUsuario, actualizarUsuario, alternarEstadoUsuario, listarUsuarios } from '../src/services/usuarios.js'
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
