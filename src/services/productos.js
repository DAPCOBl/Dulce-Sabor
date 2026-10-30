import { apiRequest } from './api.js'
import { consulta, listarTodo, mutar } from './datos.js'
export const listarProductos = (params, options) => apiRequest('/productos' + consulta(params), options)
export const opcionesProductos = options => apiRequest('/productos/opciones', options)
export const catalogoCompleto = options => listarTodo('/productos', 'productos', {}, options)
export const crearProducto = async datos => (await mutar('/productos', { method: 'POST', body: datos })).producto
export const actualizarProducto = async (id, datos) => (await mutar(`/productos/${encodeURIComponent(id)}`, { method: 'PATCH', body: datos })).producto
export const alternarEstadoProducto = producto => mutar(`/productos/${encodeURIComponent(producto.id)}/estado`, {
  method: 'PATCH', body: { estado: producto.estado === 'Activo' ? 'Inactivo' : 'Activo' },
})
