import { PRODUCTOS_CATALOGO, CATEGORIAS } from './productos'

// Catálogo de existencias del módulo de inventario. Las existencias salen del
// mismo catálogo que venden el punto de venta y administra el administrador:
// cada producto conserva su id para que el stock se mantenga sincronizado.
export const CATEGORIAS_INVENTARIO = CATEGORIAS

export const RESPONSABLES_INVENTARIO = ['María García', 'Renzo Soto', 'Ana López']

export const INVENTARIO = PRODUCTOS_CATALOGO.map((producto) => ({
  id: producto.id,
  nombre: producto.nombre,
  sku: producto.sku,
  categoria: producto.categoria,
  stock: producto.stock,
  minimo: producto.stockMinimo,
  enPos: producto.estado === 'Activo',
}))

// Motivos que justifican cada tipo de movimiento.
export const MOTIVOS_ENTRADA = [
  'Producción de la mañana',
  'Proveedor',
  'Devolución de POS',
  'Transferencia desde otra sede',
]

export const MOTIVOS_AJUSTE = [
  'Conteo físico',
  'Merma por caducidad',
  'Error de registro',
  'Producto dañado',
]

export const TIPOS_MOVIMIENTO = {
  entrada: { etiqueta: 'Entrada', clase: 'entrada' },
  ajuste: { etiqueta: 'Ajuste', clase: 'ajuste' },
  venta: { etiqueta: 'Venta', clase: 'venta' },
  merma: { etiqueta: 'Merma', clase: 'merma' },
}

// Historial semilla del día: alimenta la tabla de movimientos recientes.
export const MOVIMIENTOS_INICIALES = [
  {
    id: 'mov-1',
    hora: '10:42',
    referencia: 'MOV-1044',
    tipo: 'venta',
    productoId: 'p13',
    producto: 'Rol de canela',
    sku: 'PAN-003',
    cambio: -2,
    saldo: 3,
    responsable: 'María García',
    motivo: 'Venta en punto de venta',
  },
  {
    id: 'mov-2',
    hora: '10:38',
    referencia: 'MOV-1043',
    tipo: 'entrada',
    productoId: 'p13',
    producto: 'Rol de canela',
    sku: 'PAN-003',
    cambio: 12,
    saldo: 5,
    responsable: 'María García',
    motivo: 'Producción de la mañana',
  },
  {
    id: 'mov-3',
    hora: '10:15',
    referencia: 'MOV-1042',
    tipo: 'merma',
    productoId: 'p24',
    producto: 'Tarta de fresa',
    sku: 'PAS-002',
    cambio: -1,
    saldo: 0,
    responsable: 'Ana López',
    motivo: 'Merma por caducidad',
  },
  {
    id: 'mov-4',
    hora: '09:58',
    referencia: 'MOV-1041',
    tipo: 'ajuste',
    productoId: 'p7',
    producto: 'Pastel de chocolate',
    sku: 'PAS-001',
    cambio: -1,
    saldo: 4,
    responsable: 'María García',
    motivo: 'Conteo físico',
  },
  {
    id: 'mov-5',
    hora: '09:41',
    referencia: 'MOV-1040',
    tipo: 'entrada',
    productoId: 'p25',
    producto: 'Capuchino',
    sku: 'BEB-001',
    cambio: 10,
    saldo: 22,
    responsable: 'Renzo Soto',
    motivo: 'Proveedor',
  },
  {
    id: 'mov-6',
    hora: '09:22',
    referencia: 'MOV-1039',
    tipo: 'venta',
    productoId: 'p3',
    producto: 'Croissant de mantequilla',
    sku: 'PAN-001',
    cambio: -1,
    saldo: 8,
    responsable: 'Ana López',
    motivo: 'Venta en punto de venta',
  },
  {
    id: 'mov-7',
    hora: '08:55',
    referencia: 'MOV-1038',
    tipo: 'entrada',
    productoId: 'i01',
    producto: 'Concha de chocolate',
    sku: 'PAN-004',
    cambio: 18,
    saldo: 14,
    responsable: 'Renzo Soto',
    motivo: 'Producción de la mañana',
  },
  {
    id: 'mov-8',
    hora: '08:30',
    referencia: 'MOV-1037',
    tipo: 'ajuste',
    productoId: 'i04',
    producto: 'Cheesecake de maracuyá',
    sku: 'PAS-003',
    cambio: 2,
    saldo: 7,
    responsable: 'María García',
    motivo: 'Error de registro',
  },
  {
    id: 'mov-9',
    hora: '08:05',
    referencia: 'MOV-1036',
    tipo: 'entrada',
    productoId: 'p23',
    producto: 'Muffin de arándanos',
    sku: 'PAN-002',
    cambio: 15,
    saldo: 10,
    responsable: 'Renzo Soto',
    motivo: 'Proveedor',
  },
]
