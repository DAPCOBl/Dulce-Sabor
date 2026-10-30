import { apiRequest } from './api.js'
import { consulta, mutar } from './datos.js'

export const listarGastos = (params, options) => apiRequest('/gastos' + consulta(params), options)
export const crearGasto = async datos => (await mutar('/gastos', { method: 'POST', body: datos })).gasto
export const anularGasto = async (id, motivo) => (await mutar(`/gastos/${encodeURIComponent(id)}/anulacion`, {
  method: 'POST', body: { motivo },
})).gasto
