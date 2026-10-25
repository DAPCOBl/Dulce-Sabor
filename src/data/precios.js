// El total de una venta es siempre la suma simple de los precios de menú.
// No se aplican recargos, impuestos ni comisiones: se cobra exactamente
// lo que dice la etiqueta del producto.

// Subtotal de un ítem (precio × cantidad). Punto único de cálculo para
// evitar duplicar la fórmula en la UI.
export function subtotalDe(item) {
  const precio = Number(item?.precio) || 0
  const cantidad = Number(item?.cantidad) || 0
  return precio * cantidad
}

export function totalDe(items) {
  if (!Array.isArray(items)) return 0
  return items.reduce((acc, item) => acc + subtotalDe(item), 0)
}
