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
import { totalDe } from '../../utils/precios'
import { cobrarVenta, cobroPendiente, ventasDelDia } from '../../services/ventas'
import { useRemote } from '../../hooks/useRemote'
import { catalogoCompleto, opcionesProductos } from '../../services/productos'
import { invalidarDatos } from '../../services/datos'
import RemoteStatus from '../../components/ui/RemoteStatus'
import '../../components/pos/pos.css'

const VACIO = []

function CajeroHome({ session, onLogout }) {
  const [vista, setVista] = useState('pos')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')
  const [pendiente, setPendiente] = useState(() => cobroPendiente(session.user.id))
  const [carrito, setCarrito] = useState(() => cobroPendiente(session.user.id)?.preview ?? [])
  const [metodoPago, setMetodoPago] = useState(() => cobroPendiente(session.user.id)?.body.metodo ?? 'efectivo')
  const [recibido, setRecibido] = useState(() => String(cobroPendiente(session.user.id)?.body.recibido ?? ''))
  const [mensaje, mostrarAviso, cerrarAviso] = useAviso()
  const [ventaConfirmada, setVentaConfirmada] = useState(null)
  const [ventaDetalle, setVentaDetalle] = useState(null)
  const remote = useRemote(async options => {
    const [productos, opciones, ventas] = await Promise.all([catalogoCompleto(options), opcionesProductos(options), ventasDelDia(options)])
    return { productos: productos.map(productoConPrecio), opciones, ventas }
  })
  const productos = remote.data?.productos ?? VACIO
  const ventas = remote.data?.ventas ?? VACIO
  const [cobrando, setCobrando] = useState(false)
  const cobrandoRef = useRef(false)
  const confirmadaRef = useRef(null)
  const carritoVista = useMemo(() => carrito.map(item => {
    const producto = productos.find(p => p.id === item.id)
    return productoConPrecio(pendiente || !producto ? item : { ...item, nombre: producto.nombre, precio: producto.precio })
  }), [carrito, productos, pendiente])
  const cobrarRef = useRef(() => {})

  const total = useMemo(() => totalDe(carritoVista), [carritoVista])

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
    if (cobrandoRef.current || pendiente) return
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
    if (cobrandoRef.current || pendiente) return
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
    if (cobrandoRef.current || pendiente) return
    setCarrito([])
    setRecibido('')
    cerrarAviso()
  }

  async function cobrar() {
    if (carrito.length === 0 || confirmadaRef.current || cobrandoRef.current) return
    if (efectivoInsuficiente && !pendiente) {
      mostrarAviso(
        recibido.trim() === ''
          ? 'Ingresa el dinero recibido antes de cobrar.'
          : 'El importe recibido es menor al total a cobrar.',
      )
      return
    }

    cobrandoRef.current = true; setCobrando(true)
    try {
      const body = pendiente?.body ?? { items: carrito.map(({ id, cantidad }) => ({ id, cantidad })), metodo: metodoPago,
        ...(metodoPago === 'efectivo' ? { recibido: recibidoNumero } : {}) }
      const venta = await cobrarVenta(session.user.id, body, carritoVista)
      confirmadaRef.current = venta
      setPendiente(null); setVentaConfirmada(venta); cerrarAviso()
    } catch (error) {
      const actual = cobroPendiente(session.user.id)
      setPendiente(actual); mostrarAviso(error.message)
      if (!actual) invalidarDatos()
    } finally { cobrandoRef.current = false; setCobrando(false) }
  }

  function reiniciarVenta() {
    if (pendiente || cobrandoRef.current) return
    confirmadaRef.current = null
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
    if (pendiente) { mostrarAviso('Confirma el cobro pendiente antes de iniciar otra venta.'); return }
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
        <RemoteStatus {...remote} />
        {pendiente && <p className="ui__request-error" role="alert">Hay un cobro pendiente de confirmar. Reintenta el cobro para consultar su resultado sin duplicarlo.</p>}
        <div className="pos__area">
          {remote.data && (vista === 'pos' ? (
            <>
              <PosProductos
                filtrados={filtrados}
                categorias={remote.data.opciones.categorias}
                bloqueado={cobrando || Boolean(pendiente)}
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
                onMetodo={value => { if (!pendiente && !cobrandoRef.current) setMetodoPago(value) }}
                recibido={recibido}
                onRecibido={value => { if (!pendiente && !cobrandoRef.current) setRecibido(value) }}
                total={total}
                cambio={cambio}
                onCobrar={cobrar}
                efectivoInsuficiente={efectivoInsuficiente}
                faltante={faltante}
                cobrando={cobrando}
                pendiente={Boolean(pendiente)}
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
          ))}

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
