// El total de una venta es siempre la suma simple de los precios de menú.
// No se aplican recargos, impuestos ni comisiones: se cobra exactamente
// lo que dice la etiqueta del producto.
export function totalDe(items) {
  return items.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
}
