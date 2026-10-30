import { apiRequest, ApiError } from './api.js'
import { consulta, listarTodo, invalidarDatos } from './datos.js'
import { hoyColombia } from '../utils/fechas.js'
const pendientes = new Map()
const storageKey = id => `dulcesabor:cobro:${id}`
export const listarVentas = (params, options) => apiRequest('/ventas' + consulta(params), options)
export const resumenVentas = (params, options) => apiRequest('/ventas/resumen' + consulta(params), options)
export const opcionesVentas = options => apiRequest('/ventas/opciones', options)
export const ventasDelDia = options => listarTodo('/ventas', 'ventas', { desde: hoyColombia(), hasta: hoyColombia() }, options)
export function cobroPendiente(id) {
  if (pendientes.has(id)) return pendientes.get(id)
  try {
    const value = JSON.parse(globalThis.sessionStorage?.getItem(storageKey(id)) ?? 'null')
    if (value && typeof value.key === 'string' && Array.isArray(value.body?.items) && Array.isArray(value.preview)) {
      pendientes.set(id, value); return value
    }
  } catch { /* Un borrador corrupto no reemplaza datos del servidor. */ }
  return null
}
function guardarPendiente(id, value) {
  if (value) pendientes.set(id, value)
  else pendientes.delete(id)
  try {
    if (value) globalThis.sessionStorage?.setItem(storageKey(id), JSON.stringify(value))
    else globalThis.sessionStorage?.removeItem(storageKey(id))
  } catch { /* El reintento sigue protegido mientras la pestaña permanezca abierta. */ }
}
export async function cobrarVenta(userId, body, preview) {
  let intento = cobroPendiente(userId)
  if (intento && JSON.stringify(intento.body) !== JSON.stringify(body)) throw new ApiError('Hay un cobro pendiente. Confirma ese cobro antes de cambiar la venta.', 409)
  if (!intento) {
    intento = { key: crypto.randomUUID(), body, preview }
    guardarPendiente(userId, intento)
  }
  try {
    const result = await apiRequest('/ventas', { method: 'POST', body: intento.body, headers: { 'Idempotency-Key': intento.key } })
    guardarPendiente(userId, null); invalidarDatos()
    return result.venta
  } catch (error) {
    if ([400, 404, 409, 413, 422].includes(error.status)) guardarPendiente(userId, null)
    throw error
  }
}
