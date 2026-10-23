const SESSION_KEY = 'dulcesabor:session'

// Credenciales de demostración (solo frontend).
// Reemplazar por un login real contra el backend antes de producción.
const USERS = [
  {
    email: 'cristian@dulcesabor.com',
    password: 'admin',
    nombre: 'María García',
    rol: 'administrador',
  },
  {
    email: 'renzo@dulcesabor.com',
    password: 'cajero',
    nombre: 'Renzo',
    rol: 'cajero',
  },
]

export function login(email, password) {
  const user = USERS.find(
    (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password,
  )

  if (!user) {
    return { ok: false, error: 'Correo o contraseña incorrectos.' }
  }

  const session = { user: { nombre: user.nombre, email: user.email, rol: user.rol } }
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
