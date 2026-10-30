import { apiRequest, ApiError } from './api.js'
import { clearSession, getSession, publicUser, saveSession } from './session.js'

export { getSession } from './session.js'

export async function login(email, password) {
  const data = await apiRequest('/auth/login', { method: 'POST', auth: false,
    body: { email: email.trim().toLowerCase(), password } })
  if (typeof data.expiresIn !== 'number' || data.expiresIn <= 0 || data.expiresIn > 86400) {
    throw new ApiError('El servidor devolvió una sesión inválida.', 502)
  }
  try {
    const session = saveSession({ token: data.token, user: data.user,
      expiresAt: Date.now() + Math.floor(data.expiresIn * 1000) })
    return { ok: true, session }
  } catch {
    throw new ApiError('El servidor devolvió una sesión inválida.', 502)
  }
}

export async function validateSession({ signal } = {}) {
  const current = getSession()
  if (!current) return null
  const data = await apiRequest('/auth/me', { token: current.token, signal })
  if (signal?.aborted || getSession()?.token !== current.token) return null
  try { return saveSession({ ...current, user: publicUser(data.user) }) } catch {
    throw new ApiError('El servidor devolvió un usuario inválido.', 502)
  }
}

export async function logout() {
  const current = getSession()
  if (!current) { clearSession(); return }
  let reason = 'logout'
  try {
    await apiRequest('/auth/logout', { method: 'POST', token: current.token })
  } catch (error) {
    if (error.status !== 401) reason = 'logout-offline'
  } finally {
    clearSession(reason, current.token)
  }
}

export function isAdministrador(session) {
  return session?.user?.rol === 'administrador'
}
