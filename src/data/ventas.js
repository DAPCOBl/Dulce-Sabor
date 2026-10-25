import { formatHora } from '../components/ui/format'
import { PRODUCTOS_POR_ID } from './menu'
import { totalDe } from './precios'

export const DATOS_SEDE = {
  sucursal: 'Sede principal',
  moneda: 'COP',
}

// Semilla de ventas del día: cada venta referencia productos reales del menú
// (id + cantidad). Los importes se calculan con los precios actuales.
const SEMILLA_VENTAS = [
  {
    id: 'v4',
    folio: 'DS-0247',
    hora: '10:38',
    metodo: 'efectivo',
    items: [
      { id: 'p25', cantidad: 2 },
      { id: 'p24', cantidad: 1 },
    ],
  },
  {
    id: 'v3',
    folio: 'DS-0246',
    hora: '10:31',
    metodo: 'tarjeta',
    items: [
      { id: 'p7', cantidad: 1 },
      { id: 'p13', cantidad: 2 },
    ],
  },
  {
    id: 'v2',
    folio: 'DS-0245',
    hora: '10:26',
    metodo: 'efectivo',
    items: [
      { id: 'p3', cantidad: 3 },
      { id: 'p23', cantidad: 1 },
    ],
  },
  {
    id: 'v1',
    folio: 'DS-0244',
    hora: '10:18',
    metodo: 'tarjeta',
    items: [
      { id: 'p25', cantidad: 1 },
      { id: 'p7', cantidad: 1 },
      { id: 'p13', cantidad: 1 },
    ],
  },
]

function itemsDeProductos(items) {
  return items.map(({ id, cantidad }) => {
    const producto = PRODUCTOS_POR_ID.get(id)
    if (!producto) throw new Error(`Producto desconocido: ${id}`)
    return {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
    }
  })
}

export const VENTAS_INICIALES = SEMILLA_VENTAS.map((venta) => {
  const items = itemsDeProductos(venta.items)
  return {
    id: venta.id,
    folio: venta.folio,
    hora: venta.hora,
    metodo: venta.metodo,
    items,
    importe: totalDe(items),
  }
})

export function crearVenta(ventas, carrito, metodo) {
  const numeros = ventas
    .map((venta) => Number(venta.folio.replace(/\D/g, '')))
    .filter((numero) => Number.isFinite(numero))
  const siguiente = (numeros.length > 0 ? Math.max(...numeros) : 0) + 1
  const folio = `DS-${String(siguiente).padStart(4, '0')}`

  const items = carrito.map((item) => ({
    id: item.id,
    nombre: item.nombre,
    precio: item.precio,
    cantidad: item.cantidad,
  }))

  return {
    id: `${folio}-${Date.now()}`,
    folio,
    hora: formatHora(new Date()),
    metodo,
    items,
    importe: totalDe(items),
  }
}
