const SESSION_KEY = 'dulcesabor:session'
const listeners = new Set()

export function publicUser(user) {
  if (!user || !['administrador', 'cajero'].includes(user.rol) || user.estado !== 'Activo' ||
      !['id', 'nombre', 'email'].every(field => typeof user[field] === 'string' && user[field].trim())) {
    throw new Error('El servidor devolvió un usuario inválido.')
  }
  const { id, nombre, email, rol, estado, creado, ultimoAcceso } = user
  return { id, nombre, email, rol, estado, creado, ultimoAcceso }
}

function loadSession() {
  // Las sesiones del prototipo no contienen token y dejan de ser válidas.
  try {
    for (const key of [SESSION_KEY, 'dulcesabor:estado:v2', 'dulcesabor:usuarios:v1']) globalThis.localStorage?.removeItem(key)
  } catch { /* Puede estar bloqueado. */ }
  try {
    const raw = globalThis.sessionStorage?.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (typeof session.token !== 'string' || !session.token || !Number.isSafeInteger(session.expiresAt) || session.expiresAt <= Date.now()) {
      throw new Error('Sesión inválida o vencida.')
    }
    return { token: session.token, expiresAt: session.expiresAt, user: publicUser(session.user) }
  } catch {
    try { globalThis.sessionStorage?.removeItem(SESSION_KEY) } catch { /* Continúa sin sesión. */ }
    return null
  }
}

let state = { session: loadSession(), reason: '' }

export function getAuthState() { return state }
export function getSession() { return state.session }
export function subscribeSession(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function saveSession(session) {
  const next = { token: session.token, expiresAt: session.expiresAt, user: publicUser(session.user) }
  if (typeof next.token !== 'string' || !next.token || !Number.isSafeInteger(next.expiresAt) || next.expiresAt <= Date.now()) {
    throw new Error('El servidor devolvió una sesión inválida.')
  }
  try { globalThis.sessionStorage?.setItem(SESSION_KEY, JSON.stringify(next)) } catch { /* Sesión en memoria. */ }
  state = { session: next, reason: '' }
  listeners.forEach(listener => listener())
  return next
}

export function clearSession(reason = '', expectedToken) {
  // Una respuesta vieja nunca puede cerrar una sesión que inició después.
  if (expectedToken !== undefined && state.session?.token !== expectedToken) return
  try { globalThis.sessionStorage?.removeItem(SESSION_KEY) } catch { /* Limpia al menos la memoria. */ }
  state = { session: null, reason }
  listeners.forEach(listener => listener())
}
