import { clearSession, getSession } from './session.js'

export const API_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true, token, signal, timeout = 10000, headers = {}, responseType = 'json' } = {}) {
  const session = getSession()
  const accessToken = token ?? session?.token
  if (auth && (!accessToken || (accessToken === session?.token && session.expiresAt <= Date.now()))) {
    clearSession('expired', accessToken)
    throw new ApiError('Tu sesión venció. Vuelve a iniciar sesión.', 401)
  }

  const controller = new AbortController()
  const cancel = () => controller.abort(signal.reason)
  if (signal?.aborted) cancel()
  else signal?.addEventListener('abort', cancel, { once: true })
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, timeout)

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { Accept: 'application/json', ...headers, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(auth ? { Authorization: `Bearer ${accessToken}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: controller.signal,
      cache: 'no-store',
    })
    if (response.status === 401 && auth) clearSession('expired', accessToken)
    if (response.ok && responseType === 'blob') {
      return { blob: await response.blob(), filename: response.headers.get('Content-Disposition')?.match(/filename="([^"]+)"/)?.[1] ?? 'reporte.csv' }
    }
    let data
    try { data = await response.json() } catch {
      if (response.status === 401) throw new ApiError('Tu sesión venció. Vuelve a iniciar sesión.', 401)
      throw new ApiError('El servidor devolvió una respuesta inválida. Intenta nuevamente.', response.status || 502)
    }
    if (!response.ok || data?.ok !== true) {
      throw new ApiError(typeof data?.error === 'string' ? data.error : 'No se pudo completar la solicitud.', response.status)
    }
    return data
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Solicitud cancelada.', 'AbortError')
    if (timedOut) throw new ApiError('El servidor tardó demasiado en responder. Intenta nuevamente.', 408)
    if (error instanceof ApiError) throw error
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión e intenta nuevamente.')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', cancel)
  }
}
