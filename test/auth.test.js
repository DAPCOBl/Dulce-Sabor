import { test, beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'

class MemoryStorage {
  data = new Map()
  getItem(key) { return this.data.get(key) ?? null }
  setItem(key, value) { this.data.set(key, String(value)) }
  removeItem(key) { this.data.delete(key) }
  clear() { this.data.clear() }
}
Object.defineProperty(globalThis, 'localStorage', { value: new MemoryStorage(), configurable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: new MemoryStorage(), configurable: true })
const { getSession, getAuthState, saveSession, clearSession, subscribeSession } = await import('../src/services/session.js')
const { login, logout, validateSession, isAdministrador } = await import('../src/services/auth.js')
const { apiRequest, API_URL } = await import('../src/services/api.js')
const originalFetch = globalThis.fetch
const user = { id: 'admin', nombre: 'Administrador', email: 'admin@example.com', rol: 'administrador', estado: 'Activo' }
const response = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
const session = (token = 'token-prueba') => ({ token, user, expiresAt: Date.now() + 3600000 })
beforeEach(() => { clearSession(); localStorage.clear(); sessionStorage.clear(); globalThis.fetch = originalFetch })
after(() => { clearSession(); globalThis.fetch = originalFetch })

test('login llama a la API con correo normalizado, sin modificar ni guardar la contraseña', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${API_URL}/auth/login`); assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, undefined)
    assert.deepEqual(JSON.parse(options.body), { email: 'admin@example.com', password: ' Clave123 ' })
    return response({ ok: true, token: 'token-servidor', expiresIn: 3600, user: { ...user, password: 'nunca-guardar' } })
  }
  const result = await login(' ADMIN@example.com ', ' Clave123 ')
  assert.equal(result.session.token, 'token-servidor'); assert.equal(result.session.user.password, undefined)
  assert.equal(localStorage.getItem('dulcesabor:session'), null)
  assert.ok(!sessionStorage.getItem('dulcesabor:session').includes('Clave123'))
  assert.ok(!sessionStorage.getItem('dulcesabor:session').includes('nunca-guardar'))
  assert.ok(isAdministrador(result.session))
})
test('credenciales rechazadas no abren una sesión ni usan los usuarios simulados', async () => {
  globalThis.fetch = async () => response({ ok: false, error: 'Correo o contraseña incorrectos.' }, 401)
  await assert.rejects(login('admin@example.com', 'incorrecta'), /Correo o contraseña/)
  assert.equal(getSession(), null)
})
test('backend desconectado no permite entrar con credenciales del prototipo', async () => {
  globalThis.fetch = async () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(login('cristian@dulcesabor.com', 'admin'), /No se pudo conectar/)
  assert.equal(getSession(), null)
})
test('rechaza respuestas de login incompletas o roles desconocidos', async () => {
  for (const body of [{ ok: true, user }, { ok: true, token: 'token', expiresIn: 3600, user: { ...user, rol: 'superadmin' } }]) {
    globalThis.fetch = async () => response(body)
    await assert.rejects(login(user.email, 'Clave123'), /sesión inválida/)
    assert.equal(getSession(), null)
  }
})
test('validar sesión consulta me con Bearer y actualiza rol y nombre desde el servidor', async () => {
  saveSession(session())
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${API_URL}/auth/me`); assert.equal(options.headers.Authorization, 'Bearer token-prueba')
    return response({ ok: true, user: { ...user, nombre: 'Nombre actualizado', rol: 'cajero' } })
  }
  const checked = await validateSession()
  assert.equal(checked.user.nombre, 'Nombre actualizado'); assert.equal(isAdministrador(checked), false)
})
test('un 401 invalida memoria y almacenamiento; un 403 conserva la sesión', async () => {
  saveSession(session())
  globalThis.fetch = async () => response({ ok: false, error: 'Sin permiso' }, 403)
  await assert.rejects(apiRequest('/usuarios'), error => error.status === 403)
  assert.ok(getSession())
  globalThis.fetch = async () => response({ ok: false, error: 'Sesión inválida o expirada.' }, 401)
  await assert.rejects(validateSession(), error => error.status === 401)
  assert.equal(getSession(), null); assert.equal(sessionStorage.getItem('dulcesabor:session'), null)
  assert.equal(getAuthState().reason, 'expired')
})
test('una respuesta vieja no invalida ni sobreescribe una sesión más reciente', async () => {
  saveSession(session('anterior'))
  let responder
  globalThis.fetch = () => new Promise(resolve => { responder = resolve })
  const pendiente = validateSession()
  saveSession(session('nueva'))
  responder(response({ ok: true, user: { ...user, nombre: 'Nombre viejo' } }))
  assert.equal(await pendiente, null); assert.equal(getSession().token, 'nueva')
  const vieja = apiRequest('/auth/me', { token: 'anterior' })
  responder(response({ ok: false, error: 'Expirada' }, 401))
  await assert.rejects(vieja)
  assert.equal(getSession().token, 'nueva')
})
test('logout llama al servidor e invalida la sesión local', async () => {
  saveSession(session())
  globalThis.fetch = async (url, options) => {
    assert.equal(url, `${API_URL}/auth/logout`); assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, 'Bearer token-prueba')
    return response({ ok: true })
  }
  await logout(); assert.equal(getSession(), null); assert.equal(getAuthState().reason, 'logout')
})
test('logout sin conexión limpia el navegador e informa que no confirmó la revocación', async () => {
  saveSession(session())
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await logout(); assert.equal(getSession(), null); assert.equal(getAuthState().reason, 'logout-offline')
})
test('un error de conexión al validar permite reintentar sin perder el token', async () => {
  saveSession(session())
  globalThis.fetch = async () => { throw new TypeError('Offline') }
  await assert.rejects(validateSession(), /No se pudo conectar/)
  assert.equal(getSession().token, 'token-prueba')
})
test('respuestas HTML y rate limit se presentan como errores comprensibles', async () => {
  globalThis.fetch = async () => new Response('<html>Error</html>', { status: 502 })
  await assert.rejects(login(user.email, 'Clave123'), /respuesta inválida/)
  globalThis.fetch = async () => response({ ok: false, error: 'Demasiados intentos.' }, 429)
  await assert.rejects(login(user.email, 'Clave123'), error => error.status === 429 && error.message.includes('Demasiados'))
})
test('cancela solicitudes y limita el tiempo de espera', async () => {
  globalThis.fetch = async (url, { signal }) => new Promise((resolve, reject) => {
    if (signal.aborted) reject(signal.reason)
    signal.addEventListener('abort', () => reject(signal.reason), { once: true })
  })
  await assert.rejects(apiRequest('/auth/login', { auth: false, timeout: 5 }), error => error.status === 408)
  const controller = new AbortController(); controller.abort()
  await assert.rejects(apiRequest('/auth/login', { auth: false, signal: controller.signal }), error => error.name === 'AbortError')
})
test('descarta sesiones antiguas sin token y almacenamiento corrupto o vencido', async () => {
  localStorage.setItem('dulcesabor:session', JSON.stringify({ user }))
  for (const [i, raw] of ['{mal json', JSON.stringify({ user }), JSON.stringify({ ...session(), expiresAt: Date.now() - 1000 })].entries()) {
    sessionStorage.setItem('dulcesabor:session', raw)
    const fresh = await import(`../src/services/session.js?invalid=${i}`)
    assert.equal(fresh.getSession(), null); assert.equal(sessionStorage.getItem('dulcesabor:session'), null)
  }
  assert.equal(localStorage.getItem('dulcesabor:session'), null)
})
test('restaura candidatos de sessionStorage para validarlos y publica cambios de sesión', async () => {
  sessionStorage.setItem('dulcesabor:session', JSON.stringify(session('restaurada')))
  const fresh = await import('../src/services/session.js?restaurada')
  assert.equal(fresh.getSession().token, 'restaurada')
  let cambios = 0
  const unsubscribe = subscribeSession(() => { cambios++ })
  saveSession(session()); clearSession(); unsubscribe()
  assert.equal(cambios, 2)
})

test('retira los datos comerciales del prototipo y conserva correo y cobros pendientes', async () => {
  localStorage.setItem('dulcesabor:estado:v2', '{"ventas":[]}')
  localStorage.setItem('dulcesabor:usuarios:v1', '[{"password":"demo"}]')
  localStorage.setItem('dulcesabor:email', 'recordado@example.com')
  sessionStorage.setItem('dulcesabor:cobro:admin', '{"key":"pendiente"}')
  await import('../src/services/session.js?limpieza')
  assert.equal(localStorage.getItem('dulcesabor:estado:v2'), null)
  assert.equal(localStorage.getItem('dulcesabor:usuarios:v1'), null)
  assert.equal(localStorage.getItem('dulcesabor:email'), 'recordado@example.com')
  assert.equal(sessionStorage.getItem('dulcesabor:cobro:admin'), '{"key":"pendiente"}')
})
