import { PRODUCTOS_CATALOGO } from './productos'

// El punto de venta vende exactamente el catálogo de la sede: los mismos
// productos, precios y existencias que administra el administrador.
export const PRODUCTOS = PRODUCTOS_CATALOGO

export const PRODUCTOS_POR_ID = new Map(PRODUCTOS.map((producto) => [producto.id, producto]))
