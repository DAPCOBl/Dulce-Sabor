export function hoyColombia() {
  const partes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const valor = type => partes.find(parte => parte.type === type).value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}
export function desplazarDia(fecha, dias) {
  const resultado = new Date(`${fecha}T12:00:00Z`)
  resultado.setUTCDate(resultado.getUTCDate() + dias)
  return resultado.toISOString().slice(0, 10)
}

export function fechaComprobante(fecha, corto = false) {
  return new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota',
    ...(corto ? { day: 'numeric', month: 'short', year: 'numeric' } : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  }).format(new Date(fecha))
}
