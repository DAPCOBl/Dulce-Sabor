import { useSyncExternalStore } from 'react'
import { productoConPrecio } from '../components/ui/format'
import { INVENTARIO, MOVIMIENTOS_INICIALES } from '../data/inventario'
import { PRODUCTOS } from '../data/menu'
import { prefijoDeCategoria } from '../data/productos'
import { VENTAS_INICIALES } from '../data/ventas'

// Estado compartido entre el rol de cajero (punto de venta) y el de
// administrador (resumen del negocio). Es la única fuente de verdad para
// el ledger de ventas y el inventario.
const CAJERO_SEMILLA = 'Ana López'
const ESTADO_KEY = 'dulcesabor:estado:v2'

const ESTADO_INICIAL = {
  ventas: VENTAS_INICIALES.map((venta) => ({
    ...venta,
    cajero: CAJERO_SEMILLA,
  })),
  productos: PRODUCTOS.map(productoConPrecio),
  // Existencia y trazabilidad del módulo de inventario.
  inventario: INVENTARIO,
  movimientos: MOVIMIENTOS_INICIALES,
  // Ingresos y ventas cobradas en la sesión actual (las suma el punto de venta).
  sesion: { ingresos: 0, ventas: 0 },
}

function cargarEstado() {
  try {
    const raw = localStorage.getItem(ESTADO_KEY)
    if (!raw) return ESTADO_INICIAL
    const guardado = JSON.parse(raw)
    if (!guardado?.ventas || !guardado?.productos) return ESTADO_INICIAL
    return { ...ESTADO_INICIAL, ...guardado, productos: reconciliarProductos(guardado.productos) }
  } catch {
    return ESTADO_INICIAL
  }
}

// Campos que el administrador puede editar de una ficha de producto.
const CAMPOS_EDITABLES = [
  'nombre',
  'sku',
  'categoria',
  'precio',
  'coste',
  'stock',
  'stockMinimo',
  'estado',
]

function fusionarProducto(canonico, guardado) {
  const producto = { ...canonico }
  if (!guardado) return producto
  for (const campo of CAMPOS_EDITABLES) {
    if (guardado[campo] !== undefined) producto[campo] = guardado[campo]
  }
  // La imagen es obligatoria: solo se respeta la guardada si existe, para no
  // perder la imagen del catálogo por estados antiguos sin foto.
  if (guardado.imagen) producto.imagen = guardado.imagen
  return producto
}

// El estado guardado puede venir de una versión anterior del catálogo: se
// rescata lo ya editado y se completan los productos que faltaban.
function reconciliarProductos(guardados) {
  const porId = new Map(guardados.map((producto) => [producto.id, producto]))
  const conocidos = new Set(PRODUCTOS.map((producto) => producto.id))
  const productos = PRODUCTOS.map((producto) => fusionarProducto(producto, porId.get(producto.id)))
  const creados = guardados.filter((producto) => !conocidos.has(producto.id))

  return [...productos, ...creados].map(productoConPrecio)
}

let estado = cargarEstado()

const suscriptores = new Set()

function getEstado() {
  return estado
}

function suscribir(callback) {
  suscriptores.add(callback)
  return () => suscriptores.delete(callback)
}

function actualizar(parcial) {
  estado = { ...estado, ...parcial }
  try {
    localStorage.setItem(ESTADO_KEY, JSON.stringify(estado))
  } catch {
    // Sin persistencia (modo privado): el estado sigue vivo en memoria.
  }
  suscriptores.forEach((callback) => callback())
}

export function useEstado() {
  return useSyncExternalStore(suscribir, getEstado, getEstado)
}

// Catálogo de productos: el punto de venta y la pantalla de productos del
// administrador leen y escriben la misma lista.
function getProductos() {
  return estado.productos
}

export function useCatalogo() {
  return useSyncExternalStore(suscribir, getProductos, getProductos)
}

// Actualiza la ficha de un producto del catálogo y su equivalente en el
// módulo de inventario, para que no queden fichas distintas del mismo
// producto en dos módulos.
export function actualizarProducto(id, cambios) {
  const productos = estado.productos.map((producto) =>
    producto.id === id ? { ...producto, ...cambios } : producto,
  )

  actualizar({
    productos: productos.map(productoConPrecio),
    inventario: estado.inventario.map((item) => {
      if (item.id !== id) return item
      return {
        ...item,
        nombre: cambios.nombre ?? item.nombre,
        sku: cambios.sku ?? item.sku,
        categoria: cambios.categoria ?? item.categoria,
        minimo: cambios.stockMinimo ?? item.minimo,
        enPos: cambios.estado ? cambios.estado === 'Activo' : item.enPos,
      }
    }),
  })
}

// Activa o desactiva un producto del catálogo. Un producto inactivo deja de
// ofrecerse en el punto de venta.
export function alternarEstadoProducto(id) {
  const producto = estado.productos.find((item) => item.id === id)
  if (!producto) return
  actualizarProducto(id, { estado: producto.estado === 'Activo' ? 'Inactivo' : 'Activo' })
}

// Registra un producto nuevo: aparece en el punto de venta y en el catálogo
// administrable con la misma ficha.
export function crearProducto(producto) {
  actualizar({
    productos: [productoConPrecio(producto), ...estado.productos],
    inventario: [
      {
        id: producto.id,
        nombre: producto.nombre,
        sku: producto.sku,
        categoria: producto.categoria,
        stock: producto.stock ?? 0,
        minimo: producto.stockMinimo ?? 0,
        enPos: producto.estado === 'Activo',
      },
      ...estado.inventario,
    ],
  })
}

// SKU correlativo por categoría: PAN-007, PAS-006, BEB-005...
export function generarSku(categoria) {
  const prefijo = prefijoDeCategoria(categoria)
  const ultimo = estado.productos
    .filter((producto) => producto.sku.startsWith(`${prefijo}-`))
    .map((producto) => Number(producto.sku.split('-')[1]))
    .filter(Number.isFinite)
    .reduce((maximo, numero) => Math.max(maximo, numero), 0)

  return `${prefijo}-${String(ultimo + 1).padStart(3, '0')}`
}

// Registra una venta cobrada en el punto de venta: la agrega al ledger,
// descuenta el inventario y suma los ingresos de la sesión.
export function registrarVenta(venta, cajero) {
  const items = venta.items ?? []

  actualizar({
    ventas: [{ ...venta, cajero }, ...estado.ventas],
    productos: estado.productos.map((producto) => {
      const item = items.find((registro) => registro.id === producto.id)
      if (!item) return producto
      return { ...producto, stock: Math.max(producto.stock - item.cantidad, 0) }
    }),
    sesion: {
      ingresos: estado.sesion.ingresos + venta.importe,
      ventas: estado.sesion.ventas + 1,
    },
  })
}

// Estado de una existencia frente a su mínimo: agotado, bajo o disponible.
export function estadoDeInventario(producto) {
  if (producto.stock <= 0) return 'agotado'
  if (producto.stock <= producto.minimo) return 'bajo'
  return 'disponible'
}

function siguienteReferencia(movimientos) {
  const mayor = movimientos.reduce((maximo, movimiento) => {
    const numero = Number(String(movimiento.referencia).replace(/\D/g, ''))
    return Number.isFinite(numero) && numero > maximo ? numero : maximo
  }, 1044)
  return `MOV-${mayor + 1}`
}

function horaCorta(date) {
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

// Registra un movimiento de inventario: actualiza la existencia del producto
// (y su equivalente en el punto de venta) y lo deja trazado en el historial.
export function registrarMovimiento({ productoId, cantidad, tipo, motivo, responsable }) {
  const producto = estado.inventario.find((item) => item.id === productoId)
  if (!producto) return null

  const unidades = Math.max(Math.round(cantidad), 0)
  // Una entrada suma al stock; un ajuste fija el conteo físico como nuevo saldo.
  const nuevoStock = tipo === 'entrada' ? producto.stock + unidades : unidades
  const ahora = new Date()

  const movimiento = {
    id: `mov-${ahora.getTime()}`,
    hora: horaCorta(ahora),
    referencia: siguienteReferencia(estado.movimientos),
    tipo,
    productoId: producto.id,
    producto: producto.nombre,
    sku: producto.sku,
    cambio: nuevoStock - producto.stock,
    saldo: nuevoStock,
    responsable,
    motivo,
  }

  actualizar({
    inventario: estado.inventario.map((item) =>
      item.id === producto.id ? { ...item, stock: nuevoStock } : item,
    ),
    productos: estado.productos.map((item) =>
      item.id === producto.id ? { ...item, stock: nuevoStock } : item,
    ),
    movimientos: [movimiento, ...estado.movimientos],
  })

  return movimiento
}

// Alertas de inventario mínimo: agotado (sin unidades) y stock bajo.
export function alertasDeInventario(productos) {
  return productos
    .filter((producto) => producto.stock <= 0 || producto.stock <= producto.stockMinimo)
    .map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      estado: producto.stock <= 0 ? 'agotado' : 'bajo',
      stock: producto.stock,
      minimo: producto.stockMinimo,
    }))
    .sort((a, b) => {
      if (a.estado !== b.estado) return a.estado === 'agotado' ? -1 : 1
      return a.stock - b.stock
    })
}
