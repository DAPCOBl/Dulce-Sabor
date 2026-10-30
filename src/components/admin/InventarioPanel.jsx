import { useRef, useState } from 'react'
import ExistenciasInventario from './ExistenciasInventario'
import InventarioKpis from './InventarioKpis'
import MovimientosRecientes from './MovimientosRecientes'
import RegistroMovimiento from './RegistroMovimiento'
import Cabecera from '../ui/Cabecera'
import Paginacion from '../ui/Paginacion'
import RemoteStatus from '../ui/RemoteStatus'
import { IconPlus } from '../ui/icons'
import { useRemote } from '../../hooks/useRemote'
import { hoyColombia } from '../../utils/fechas'
import { listarInventario, obtenerInventario, movimientoPendiente, inventarioCompleto, opcionesInventario, resumenInventario, alertasInventario, listarMovimientos, registrarMovimiento } from '../../services/inventario'
import './inventario.css'

function InventarioPanel({ session }) {
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: 'todas', estado: 'todos' })
  const [pagina, setPagina] = useState(1)
  const [movPagina, setMovPagina] = useState(1)
  const [dia, setDia] = useState(hoyColombia)
  const [productoId, setProductoId] = useState('')
  const [productoFresco, setProductoFresco] = useState(null)
  const [abriendo, setAbriendo] = useState(false)
  const [error, setError] = useState('')
  const abriendoRef = useRef(false)
  const [modalAbierto, setModalAbierto] = useState(false)
  const contexto = useRemote(async options => {
    const [productos, opciones, resumen, alertas] = await Promise.all([
      inventarioCompleto(options), opcionesInventario(options), resumenInventario(options), alertasInventario(options),
    ])
    return { productos, opciones, resumen: resumen.resumen, alertas: alertas.alertas }
  })
  const listado = useRemote(options => listarInventario({ ...filtros, pagina, porPagina: 6 }, options), [filtros, pagina])
  const historial = useRemote(options => listarMovimientos({ desde: dia, hasta: dia, pagina: movPagina, porPagina: 10 }, options), [dia, movPagina])
  async function seleccionar(id, abrirModal = false) {
    if (abriendoRef.current) return
    abriendoRef.current = true; setAbriendo(true); setError('')
    try {
      const producto = (await obtenerInventario(id)).producto
      setProductoFresco(producto); setProductoId(id)
      if (abrirModal) setModalAbierto(true)
      return producto
    } catch (error) { setError(error.message) }
    finally { abriendoRef.current = false; setAbriendo(false) }
  }
  function abrir(id) {
    const elegido = movimientoPendiente()?.body.productoId || id || contexto.data?.productos[0]?.id
    if (elegido) void seleccionar(elegido, true)
  }
  async function guardarMovimiento(datos) {
    const movimiento = await registrarMovimiento(datos)
    setProductoFresco(actual => movimiento.productoActual ?? (actual?.id === movimiento.productoId ? { ...actual, stock: movimiento.saldo } : actual))
    return movimiento
  }
  const productosModal = contexto.data?.productos.map(item => productoFresco?.id === item.id ? { ...item, ...productoFresco } : item) ?? []
  function cambiarFiltro(campo, valor) { setFiltros(actual => ({ ...actual, [campo]: valor })); setPagina(1) }
  return <div className="admin__inventario">
    <Cabecera miga="Inventario" titulo="Cada pieza, en su lugar." subtitulo="Existencias y movimientos registrados en tu sede."
      acciones={<button type="button" className="ui__boton ui__boton--primario" disabled={abriendo || !contexto.data?.productos.length} onClick={() => abrir()}><IconPlus width="17" height="17" />Registrar movimiento</button>} />
    {abriendo && <p role="status">Consultando existencias actuales…</p>}
    {error && <p className="ui__request-error" role="alert">{error}</p>}
    <RemoteStatus {...contexto} />
    {contexto.data && <InventarioKpis productos={contexto.data.alertas} resumen={contexto.data.resumen} />}
    <RemoteStatus {...listado} />
    {listado.data && contexto.data && <ExistenciasInventario productos={listado.data.productos} categorias={contexto.data.opciones.categorias}
      total={listado.data.paginacion.total} porPagina={6} pagina={listado.data.paginacion.pagina} paginas={listado.data.paginacion.paginas}
      filtros={filtros} onFiltro={cambiarFiltro} onPagina={setPagina} onElegir={producto => abrir(producto.id)} />}
    <label className="admin__campo">Fecha de movimientos
      <input type="date" value={dia} onChange={event => { setDia(event.target.value); setMovPagina(1) }} />
    </label>
    <RemoteStatus {...historial} />
    {historial.data && <>
      <MovimientosRecientes movimientos={historial.data.movimientos} total={historial.data.paginacion.total} />
      <Paginacion pagina={historial.data.paginacion.pagina} paginas={historial.data.paginacion.paginas} onPagina={setMovPagina} />
    </>}
    {modalAbierto && contexto.data && <RegistroMovimiento productos={productosModal} opciones={contexto.data.opciones}
      session={session} productoId={productoId} cargandoProducto={abriendo} onProductoChange={id => seleccionar(id)} onRegistrar={guardarMovimiento} onCerrar={() => setModalAbierto(false)} />}
  </div>
}
export default InventarioPanel
