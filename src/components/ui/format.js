// Formato único de la aplicación. El punto de venta y el panel de
// administración muestran los importes y las fechas de la misma manera:
// los pesos colombianos separan los miles con punto ($128.450) y las fechas
// usan el calendario local.

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const DIAS_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]
const MESES_CORTOS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
]

// Importe en pesos colombianos: $128.450
export function moneda(valor) {
  const redondeado = Math.round(Math.abs(valor))
  const conMiles = String(redondeado).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${valor < 0 ? '-' : ''}$${conMiles}`
}

// Variación porcentual con signo: +12.4%
export function porcentaje(valor, decimales = 1) {
  const signo = valor > 0 ? '+' : ''
  return `${signo}${valor.toFixed(decimales)}%`
}

// "3 ventas" / "1 venta"
export function pluralVentas(cantidad) {
  return `${cantidad} ${cantidad === 1 ? 'venta' : 'ventas'}`
}

// Añade el precio ya formateado a la ficha de un producto.
export function productoConPrecio(producto) {
  return { ...producto, precioTexto: moneda(producto.precio) }
}

// Hora corta en 24 horas: 10:38
export function formatHora(date) {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// Fecha larga: miércoles, 21 de octubre de 2026
export function formatFecha(date) {
  const dia = DIAS[date.getDay()]
  const mes = MESES[date.getMonth()]
  return `${dia}, ${date.getDate()} de ${mes} de ${date.getFullYear()}`
}

// Fecha sin hora: 21 oct 2026
export function fechaDiaMes(date) {
  return `${date.getDate()} ${MESES_CORTOS[date.getMonth()]} ${date.getFullYear()}`
}

// Etiqueta corta de un día de la serie: Mié 21
export function diaCorto(date) {
  return `${DIAS_CORTOS[date.getDay()]} ${date.getDate()}`
}

// Comparación contra el mismo tramo del mes anterior: 1-20 sep
export function periodoMesAnteriorCorto(date) {
  const ultimoDia = new Date(date.getFullYear(), date.getMonth(), 0).getDate()
  const dia = Math.min(date.getDate(), ultimoDia)
  const mes = (date.getMonth() + 11) % 12
  return `1-${dia} ${MESES_CORTOS[mes]}`
}

// Fecha lista para <input type="date">: 2026-10-21
export function isoFecha(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mm}-${dd}`
}

// Saludo según la hora: Buenos días
export function saludo(date) {
  const hora = date.getHours()
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

// Primera palabra del nombre del usuario.
export function primerNombre(nombre = '') {
  return nombre.trim().split(' ')[0] ?? ''
}
