import {
  IconInventario,
  IconProductos,
  IconReportes,
  IconResumen,
  IconSedes,
  IconUsuarios,
  IconVentas,
} from '../ui/icons'

export const SECCIONES = [
  { id: 'resumen', etiqueta: 'Resumen', Icono: IconResumen },
  { id: 'productos', etiqueta: 'Productos', Icono: IconProductos },
  { id: 'inventario', etiqueta: 'Inventario', Icono: IconInventario },
  { id: 'ventas', etiqueta: 'Ventas', Icono: IconVentas },
  { id: 'reportes', etiqueta: 'Reportes', Icono: IconReportes },
  { id: 'sedes', etiqueta: 'Sedes', Icono: IconSedes },
  { id: 'usuarios', etiqueta: 'Usuarios', Icono: IconUsuarios },
]

export function etiquetaDeSeccion(id) {
  return SECCIONES.find((seccion) => seccion.id === id)?.etiqueta ?? 'Resumen'
}
