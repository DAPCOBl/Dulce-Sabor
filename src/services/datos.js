import { apiRequest } from './api.js'
let revision = 0
const listeners = new Set()
export const getRevision = () => revision
let stopRefresh
export function subscribeData(listener) {
  listeners.add(listener)
  if (!stopRefresh && typeof window !== 'undefined') {
    const refresh = () => { if (document.visibilityState === 'visible') invalidarDatos() }
    const timer = window.setInterval(refresh, 60000)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    stopRefresh = () => {
      window.clearInterval(timer); window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh); stopRefresh = undefined
    }
  }
  return () => { listeners.delete(listener); if (!listeners.size) stopRefresh?.() }
}
export function invalidarDatos() { revision++; listeners.forEach(listener => listener()) }
export function consulta(params = {}) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value !== '' && value != null) query.set(key, String(value))
  return query.size ? `?${query}` : ''
}
export async function mutar(path, options) {
  const result = await apiRequest(path, options)
  invalidarDatos()
  return result
}
export async function listarTodo(path, campo, params = {}, options = {}) {
  const registros = new Map()
  for (let pagina = 1; ; pagina++) {
    const result = await apiRequest(path + consulta({ ...params, pagina, porPagina: 100 }), options)
    for (const item of result[campo]) registros.set(item.id, item)
    if (pagina >= result.paginacion.paginas || result.paginacion.pagina < pagina) break
  }
  return [...registros.values()]
}
