import { apiRequest } from './api.js'
import { consulta, mutar } from './datos.js'

export const ROLES_USUARIO = [{ valor: 'administrador', etiqueta: 'Administrador' }, { valor: 'cajero', etiqueta: 'Cajero' }]
export const ESTADOS_USUARIO = ['Activo', 'Inactivo']
export const listarUsuarios = (params, options) => apiRequest('/usuarios' + consulta(params), options)
export const resumenUsuarios = options => apiRequest('/usuarios/resumen', options)
export const crearUsuario = async datos => (await mutar('/usuarios', { method: 'POST', body: datos })).user
export const actualizarUsuario = async (id, datos) => (await mutar(`/usuarios/${encodeURIComponent(id)}`, { method: 'PATCH', body: datos })).user
export const alternarEstadoUsuario = async usuario => (await mutar(`/usuarios/${encodeURIComponent(usuario.id)}/estado`, {
  method: 'PATCH', body: { estado: usuario.estado === 'Activo' ? 'Inactivo' : 'Activo' },
})).user
export const eliminarUsuario = id => mutar(`/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' })
