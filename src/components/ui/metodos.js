import { IconCash, IconCard } from './icons'

// Métodos de pago con su etiqueta y su icono. El punto de venta y el
// administrador los comparten para que un cobro se vea igual en ambos lados.
export const METODOS_PAGO = {
  efectivo: { etiqueta: 'Efectivo', Icono: IconCash },
  tarjeta: { etiqueta: 'Tarjeta', Icono: IconCard },
}

export function metodoDePago(metodo) {
  return METODOS_PAGO[metodo] ?? METODOS_PAGO.efectivo
}
