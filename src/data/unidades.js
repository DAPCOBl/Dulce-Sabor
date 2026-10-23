// Presentación en la que se vende cada producto. Vive en su propio módulo
// para que el catálogo y la pantalla de productos compartan una sola
// definición de unidades, sin depender del archivo del catálogo.

export const UNIDADES = ['pieza', 'rebanada', 'vaso']

export const UNIDAD_POR_CATEGORIA = {
  'Pan dulce': 'pieza',
  Pasteles: 'rebanada',
  'Saldados': 'pieza',
  Bebidas: 'vaso',
}
