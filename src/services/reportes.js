import { apiRequest } from './api.js'
import { consulta } from './datos.js'
export const resumenAdmin = options => apiRequest('/reportes/resumen', options)
export const reporteVentas = (params, options) => apiRequest('/reportes/ventas' + consulta(params), options)
export const exportarReporte = params => apiRequest('/reportes/exportar' + consulta(params), { responseType: 'blob' })
export function descargarArchivo({ blob, filename }) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url; enlace.download = filename
  document.body.append(enlace); enlace.click(); enlace.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
