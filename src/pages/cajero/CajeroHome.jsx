import { useEffect, useMemo, useRef, useState } from 'react'
import PosSidebar from '../../components/pos/PosSidebar'
import PosProductos from '../../components/pos/PosProductos'
import PosResumen from '../../components/pos/PosResumen'
import PosExito from '../../components/pos/PosExito'
import VentasDia from '../../components/pos/VentasDia'
import VentaDetalle from '../../components/pos/VentaDetalle'
import Toast from '../../components/ui/Toast'
import { useAviso } from '../../components/ui/useAviso'
import { productoConPrecio } from '../../components/ui/format'
import { totalDe } from '../../data/precios'
import { crearVenta } from '../../data/ventas'
import { registrarVenta, useEstado } from '../../services/estado'
import '../../components/pos/pos.css'

function CajeroHome({ session, onLogout }) {
  const [vista, setVista] = useState('pos')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [carrito, setCarrito] = useState([])
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [recibido, setRecibido] = useState('')
  const [mensaje, mostrarAviso, cerrarAviso] = useAviso()
  const [ventaConfirmada, setVentaConfirmada] = useState(null)
  const [ventaDetalle, setVentaDetalle] = useState(null)
  const { ventas, productos } = useEstado()
  const carritoVista = useMemo(() => carrito.map(productoConPrecio), [carrito])
  const cobrarRef = useRef(() => {})

  const total = useMemo(() => totalDe(carrito), [carrito])

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return productos.filter((producto) => {
      // Solo se ofrecen los productos activos del catálogo.
      if (producto.estado !== 'Activo') return false
      const coincideCategoria = categoria === 'Todos' || producto.categoria === categoria
      const coincideBusqueda =
        termino === '' ||
        producto.nombre.toLowerCase().includes(termino) ||
        producto.sku.toLowerCase().includes(termino) ||
        producto.id.includes(termino)
      return coincideCategoria && coincideBusqueda
    })
  }, [productos, busqueda, categoria])

  const recibidoNumero = Number(recibido) || 0
  const cambio = metodoPago === 'efectivo' && recibidoNumero > 0 ? recibidoNumero - total : 0
  const efectivoInsuficiente = metodoPago === 'efectivo' && recibidoNumero < total
  const faltante = Math.max(total - recibidoNumero, 0)

  function agregar(producto) {
    cerrarAviso()
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id)
      if (existente) {
        if (existente.cantidad >= producto.stock) return actual
        return actual.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item,
        )
      }
      return [
        ...actual,
        { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 },
      ]
    })
  }

  function cambiarCantidad(id, delta) {
    cerrarAviso()
    setCarrito((actual) =>
      actual
        .map((item) => {
          if (item.id !== id) return item
          const producto = productos.find((p) => p.id === id)
          const maximo = producto ? producto.stock : item.cantidad
          const cantidad = Math.min(Math.max(item.cantidad + delta, 0), maximo)
          return { ...item, cantidad }
        })
        .filter((item) => item.cantidad > 0),
    )
  }

  function vaciar() {
    setCarrito([])
    setRecibido('')
    cerrarAviso()
  }

  function cobrar() {
    if (carrito.length === 0 || ventaConfirmada) return
    if (efectivoInsuficiente) {
      mostrarAviso(
        recibido.trim() === ''
          ? 'Ingresa el dinero recibido antes de cobrar.'
          : 'El importe recibido es menor al total a cobrar.',
      )
      return
    }

    const venta = crearVenta(ventas, carrito, metodoPago)
    registrarVenta(venta, session.user.nombre)
    setVentaConfirmada({
      ...venta,
      recibido: metodoPago === 'efectivo' ? recibidoNumero : 0,
      cambio: metodoPago === 'efectivo' ? Math.max(recibidoNumero - total, 0) : 0,
    })
    cerrarAviso()
  }

  function reiniciarVenta() {
    setVentaConfirmada(null)
    setCarrito([])
    setRecibido('')
    setMetodoPago('efectivo')
    cerrarAviso()
  }

  function verVenta(venta) {
    setVentaDetalle(venta)
  }

  function irANuevaVenta() {
    setVista('pos')
    if (ventaConfirmada) {
      reiniciarVenta()
      return
    }
    mostrarAviso('Listo, prepara tu nueva venta en el punto de venta.')
  }

  useEffect(() => {
    // Mantiene la referencia al cobrar más reciente para el atajo F8.
    cobrarRef.current = cobrar
  })

  useEffect(() => {
    // Atajo F8: ir al cobro
    function onKey(event) {
      if (event.key !== 'F8' || vista !== 'pos') return
      event.preventDefault()
      cobrarRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [vista])

  return (
    <div className="pos">
      <PosSidebar vista={vista} onNavigate={setVista} session={session} onLogout={onLogout} />

      <div className="pos__cuerpo">
        <div className="pos__area">
          {vista === 'pos' ? (
            <>
              <PosProductos
                filtrados={filtrados}
                onAdd={agregar}
                busqueda={busqueda}
                onBusqueda={setBusqueda}
                categoria={categoria}
                onCategoria={setCategoria}
              />
              <PosResumen
                carrito={carritoVista}
                onCantidad={cambiarCantidad}
                onVaciar={vaciar}
                metodoPago={metodoPago}
                onMetodo={setMetodoPago}
                recibido={recibido}
                onRecibido={setRecibido}
                total={total}
                cambio={cambio}
                onCobrar={cobrar}
                efectivoInsuficiente={efectivoInsuficiente}
                faltante={faltante}
              />

              {ventaConfirmada && (
                <PosExito venta={ventaConfirmada} onNuevaVenta={reiniciarVenta} />
              )}
            </>
          ) : (
            <VentasDia
              ventas={ventas}
              onNuevaVenta={irANuevaVenta}
              onVer={verVenta}
            />
          )}

          {ventaDetalle && (
            <VentaDetalle
              venta={ventaDetalle}
              onCerrar={() => setVentaDetalle(null)}
              cajero={session.user.nombre}
            />
          )}
        </div>

        <Toast mensaje={mensaje} />
      </div>
    </div>
  )
}

export default CajeroHome
