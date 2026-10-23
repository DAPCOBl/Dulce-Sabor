import { PRODUCTOS_CATALOGO } from './productos'

// El punto de venta vende exactamente el catálogo de la sede: los mismos
// productos, precios y existencias que administra el administrador.
export const PRODUCTOS = PRODUCTOS_CATALOGO

export const PRODUCTOS_POR_ID = new Map(PRODUCTOS.map((producto) => [producto.id, producto]))

const CARRITO_INICIAL_IDS = [
  { id: 'p3', cantidad: 1 },
  { id: 'p7', cantidad: 1 },
  { id: 'p13', cantidad: 2 },
  { id: 'p25', cantidad: 1 },
]

export const CARRITO_INICIAL = CARRITO_INICIAL_IDS.map(({ id, cantidad }) => {
  const producto = PRODUCTOS_POR_ID.get(id)
  return {
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad,
  }
})
