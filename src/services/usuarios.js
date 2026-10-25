// Gestión de usuarios de la aplicación (administradores y cajeros).
// Se persiste en localStorage para que el módulo de administración pueda
// crear, editar y desactivar cuentas, y el login las tome en cuenta.

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'dulcesabor:usuarios:v1'

export const ROLES_USUARIO = [
  { valor: 'administrador', etiqueta: 'Administrador' },
  { valor: 'cajero', etiqueta: 'Cajero' },
]

export const ESTADOS_USUARIO = ['Activo', 'Inactivo']

const USUARIOS_INICIALES = [
  {
    id: 'u-admin',
    nombre: 'cristian granados',
    email: 'cristian@dulcesabor.com',
    password: 'admin',
    rol: 'administrador',
    estado: 'Activo',
    creado: '2026-09-01',
    ultimoAcceso: 'Hoy, 08:12',
  },
  {
    id: 'u-renzo',
    nombre: 'Renzo',
    email: 'renzo@dulcesabor.com',
    password: 'cajero',
    rol: 'cajero',
    estado: 'Activo',
    creado: '2026-09-03',
    ultimoAcceso: 'Hoy, 07:40',
  },
  {
    id: 'u-ana',
    nombre: 'Ana López',
    email: 'ana.lopez@dulcesabor.com',
    password: 'cajero',
    rol: 'cajero',
    estado: 'Activo',
    creado: '2026-09-05',
    ultimoAcceso: 'Ayer, 17:20',
  },
  {
    id: 'u-camila',
    nombre: 'Camila Ríos',
    email: 'camila.rios@dulcesabor.com',
    password: 'cajero',
    rol: 'cajero',
    estado: 'Activo',
    creado: '2026-09-05',
    ultimoAcceso: 'Ayer, 16:05',
  },
  {
    id: 'u-diego',
    nombre: 'Diego Martín',
    email: 'diego.martin@dulcesabor.com',
    password: 'cajero',
    rol: 'cajero',
    estado: 'Activo',
    creado: '2026-09-06',
    ultimoAcceso: 'Ayer, 15:48',
  },
  {
    id: 'u-renzosoto',
    nombre: 'Renzo Soto',
    email: 'renzo.soto@dulcesabor.com',
    password: 'cajero',
    rol: 'cajero',
    estado: 'Inactivo',
    creado: '2026-09-10',
    ultimoAcceso: '12 oct, 09:30',
  },
]

function cargarUsuarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return USUARIOS_INICIALES
    const guardado = JSON.parse(raw)
    if (!Array.isArray(guardado) || guardado.length === 0) return USUARIOS_INICIALES
    // Migración suave: mantiene el nombre correcto para la cuenta principal.
    return guardado.map((usuario) =>
      usuario?.email?.toLowerCase() === 'cristian@dulcesabor.com'
        ? { ...usuario, nombre: 'cristian granados' }
        : usuario,
    )
  } catch {
    return USUARIOS_INICIALES
  }
}

let usuarios = cargarUsuarios()
const suscriptores = new Set()

function getUsuarios() {
  return usuarios
}

export { getUsuarios }

function suscribir(callback) {
  suscriptores.add(callback)
  return () => suscriptores.delete(callback)
}

function actualizar(nuevo) {
  usuarios = nuevo
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios))
  } catch {
    // Sin persistencia (modo privado): el estado sigue vivo en memoria.
  }
  suscriptores.forEach((callback) => callback())
}

export function useUsuarios() {
  return useSyncExternalStore(suscribir, getUsuarios, getUsuarios)
}

export function crearUsuario(datos) {
  const nuevo = {
    ...datos,
    id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    creado: datos.creado ?? new Date().toISOString().slice(0, 10),
    ultimoAcceso: datos.ultimoAcceso ?? 'Nunca',
  }
  actualizar([nuevo, ...usuarios])
  return nuevo
}

export function actualizarUsuario(id, cambios) {
  let actualizado = null
  actualizar(
    usuarios.map((usuario) => {
      if (usuario.id !== id) return usuario
      actualizado = { ...usuario, ...cambios }
      // No sobrescribir la contraseña con un valor vacío.
      if (cambios.password === undefined || cambios.password === null || cambios.password === '') {
        actualizado.password = usuario.password
      }
      return actualizado
    }),
  )
  return actualizado
}

export function alternarEstadoUsuario(id) {
  const usuario = usuarios.find((item) => item.id === id)
  if (!usuario) return false

  const nuevoEstado = usuario.estado === 'Activo' ? 'Inactivo' : 'Activo'

  // Evitar que el último administrador activo se desactive.
  if (usuario.rol === 'administrador' && nuevoEstado === 'Inactivo') {
    const adminsActivos = usuarios.filter(
      (item) => item.rol === 'administrador' && item.estado === 'Activo',
    ).length
    if (adminsActivos <= 1) return false
  }

  actualizar(
    usuarios.map((item) =>
      item.id === id ? { ...item, estado: nuevoEstado } : item,
    ),
  )
  return true
}

export function eliminarUsuario(id, usuarioActualId) {
  const usuario = usuarios.find((item) => item.id === id)
  if (!usuario) return false
  if (id === usuarioActualId) return false

  if (usuario.rol === 'administrador' && usuario.estado === 'Activo') {
    const adminsActivos = usuarios.filter(
      (item) => item.rol === 'administrador' && item.estado === 'Activo' && item.id !== id,
    ).length
    if (adminsActivos === 0) return false
  }

  actualizar(usuarios.filter((item) => item.id !== id))
  return true
}
