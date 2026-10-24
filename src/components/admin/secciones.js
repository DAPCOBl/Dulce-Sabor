import {
  IconInventario,
  IconProductos,
  IconReportes,
  IconResumen,
  IconSales,
  IconUsuarios,
} from '../ui/icons'

export const SECCIONES = [
  { id: 'resumen', etiqueta: 'Resumen', Icono: IconResumen },
  { id: 'productos', etiqueta: 'Productos', Icono: IconProductos },
  { id: 'inventario', etiqueta: 'Inventario', Icono: IconInventario },
  { id: 'ventas', etiqueta: 'Ventas', Icono: IconSales },
  { id: 'reportes', etiqueta: 'Reportes', Icono: IconReportes },
  { id: 'usuarios', etiqueta: 'Usuarios', Icono: IconUsuarios },
]

export function etiquetaDeSeccion(id) {
  return SECCIONES.find((seccion) => seccion.id === id)?.etiqueta ?? 'Resumen'
}
