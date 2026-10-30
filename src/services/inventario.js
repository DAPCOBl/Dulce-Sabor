import { apiRequest } from './api.js'
import { consulta, listarTodo, mutar } from './datos.js'
export const listarInventario = (params, options) => apiRequest('/inventario' + consulta(params), options)
export const inventarioCompleto = options => listarTodo('/inventario', 'productos', {}, options)
export const resumenInventario = options => apiRequest('/inventario/resumen', options)
export const alertasInventario = options => apiRequest('/inventario/alertas', options)
export const opcionesInventario = options => apiRequest('/inventario/opciones', options)
export const listarMovimientos = (params, options) => apiRequest('/inventario/movimientos' + consulta(params), options)
export const registrarMovimiento = async datos => (await mutar('/inventario/movimientos', { method: 'POST', body: datos })).movimiento
