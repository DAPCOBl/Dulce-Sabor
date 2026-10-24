import { getUsuarios } from './usuarios'

const SESSION_KEY = 'dulcesabor:session'

// Credenciales de demostración (solo frontend).
// Reemplazar por un login real contra el backend antes de producción.
// Las cuentas se gestionan desde el módulo de Usuarios (services/usuarios.js).

export function login(email, password) {
  const user = getUsuarios().find(
    (candidate) =>
      candidate.email === email.trim().toLowerCase() &&
      candidate.password === password &&
      candidate.estado === 'Activo',
  )

  if (!user) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  const session = { user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, session }
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session?.user?.rol) return null
    return session
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function isAdministrador(session) {
  return session?.user?.rol === 'administrador'
}

