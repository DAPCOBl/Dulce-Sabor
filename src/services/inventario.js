import { apiRequest, ApiError } from './api.js'
import { consulta, listarTodo, invalidarDatos } from './datos.js'
import { getSession } from './session.js'

export const listarInventario = (params, options) => apiRequest('/inventario' + consulta(params), options)
export const inventarioCompleto = options => listarTodo('/inventario', 'productos', {}, options)
export const obtenerInventario = (id, options) => apiRequest(`/inventario/${encodeURIComponent(id)}`, options)
export const resumenInventario = options => apiRequest('/inventario/resumen', options)
export const alertasInventario = options => apiRequest('/inventario/alertas', options)
export const opcionesInventario = options => apiRequest('/inventario/opciones', options)
export const listarMovimientos = (params, options) => apiRequest('/inventario/movimientos' + consulta(params), options)

const pendientes = new Map()
const storageKey = id => `dulcesabor:movimiento:${id}`

function validarBody(datos) {
  if (!datos || typeof datos !== 'object' || Array.isArray(datos) ||
      typeof datos.productoId !== 'string' || !datos.productoId.trim() || datos.productoId.trim().length > 100 ||
      !['entrada', 'ajuste'].includes(datos.tipo) || !Number.isSafeInteger(datos.cantidad) ||
      datos.cantidad < (datos.tipo === 'entrada' ? 1 : 0) || datos.cantidad > 2147483647 ||
      typeof datos.motivo !== 'string' || !datos.motivo.trim() || datos.motivo.trim().length > 100) {
    throw new ApiError('Selecciona un producto, tipo, motivo y cantidad entera válidos.', 400)
  }
  return { productoId: datos.productoId.trim(), cantidad: datos.cantidad, tipo: datos.tipo, motivo: datos.motivo.trim() }
}

function leerPendiente(id) {
  if (pendientes.has(id)) return pendientes.get(id)
  try {
    const value = JSON.parse(globalThis.sessionStorage?.getItem(storageKey(id)) ?? 'null')
    if (!value) return null
    if (typeof value.key !== 'string' || !/^[A-Za-z0-9_-]{8,128}$/.test(value.key)) throw new Error('Borrador inválido.')
    const intento = { key: value.key, body: validarBody(value.body) }
    pendientes.set(id, intento)
    return intento
  } catch {
    try { globalThis.sessionStorage?.removeItem(storageKey(id)) } catch { /* No reemplaza datos del servidor. */ }
    return null
  }
}

export function movimientoPendiente() {
  const id = getSession()?.user.id
  return id ? leerPendiente(id) : null
}

function guardarPendiente(id, value, expectedKey) {
  // Una confirmación tardía no debe borrar un intento posterior del mismo usuario.
  if (expectedKey !== undefined && leerPendiente(id)?.key !== expectedKey) return
  if (value) pendientes.set(id, value)
  else pendientes.delete(id)
  try {
    if (value) globalThis.sessionStorage?.setItem(storageKey(id), JSON.stringify(value))
    else globalThis.sessionStorage?.removeItem(storageKey(id))
  } catch { /* Conserva al menos el intento en memoria durante esta pestaña. */ }
}

export async function registrarMovimiento(datos) {
  const id = getSession()?.user.id
  if (!id) throw new ApiError('Debes iniciar sesión.', 401)
  const body = validarBody(datos)
  let intento = leerPendiente(id)
  if (intento && JSON.stringify(intento.body) !== JSON.stringify(body)) {
    throw new ApiError('Hay un movimiento pendiente. Confírmalo antes de registrar uno diferente.', 409)
  }
  if (!intento) {
    intento = { key: crypto.randomUUID(), body }
    guardarPendiente(id, intento)
  }
  try {
    const result = await apiRequest('/inventario/movimientos', {
      method: 'POST', body: intento.body, headers: { 'Idempotency-Key': intento.key },
    })
    guardarPendiente(id, null, intento.key)
    invalidarDatos()
    return { ...result.movimiento, productoActual: result.producto }
  } catch (error) {
    if ([400, 404, 409, 413, 422].includes(error.status)) guardarPendiente(id, null, intento.key)
    throw error
  }
}
