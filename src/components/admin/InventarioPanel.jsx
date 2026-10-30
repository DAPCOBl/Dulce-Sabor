import { useState } from 'react'
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
import { listarInventario, inventarioCompleto, opcionesInventario, resumenInventario, alertasInventario, listarMovimientos, registrarMovimiento } from '../../services/inventario'
import './inventario.css'

function InventarioPanel({ session }) {
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: 'todas', estado: 'todos' })
  const [pagina, setPagina] = useState(1)
  const [movPagina, setMovPagina] = useState(1)
  const [dia, setDia] = useState(hoyColombia)
  const [productoId, setProductoId] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const contexto = useRemote(async options => {
    const [productos, opciones, resumen, alertas] = await Promise.all([
      inventarioCompleto(options), opcionesInventario(options), resumenInventario(options), alertasInventario(options),
    ])
    return { productos, opciones, resumen: resumen.resumen, alertas: alertas.alertas }
  })
  const listado = useRemote(options => listarInventario({ ...filtros, pagina, porPagina: 6 }, options), [filtros, pagina])
  const historial = useRemote(options => listarMovimientos({ desde: dia, hasta: dia, pagina: movPagina, porPagina: 10 }, options), [dia, movPagina])
  function abrir(id) { setProductoId(id || contexto.data?.productos[0]?.id || ''); setModalAbierto(true) }
  function cambiarFiltro(campo, valor) { setFiltros(actual => ({ ...actual, [campo]: valor })); setPagina(1) }
  return <div className="admin__inventario">
    <Cabecera miga="Inventario" titulo="Cada pieza, en su lugar." subtitulo="Existencias y movimientos registrados en tu sede."
      acciones={<button type="button" className="ui__boton ui__boton--primario" disabled={!contexto.data?.productos.length} onClick={() => abrir()}><IconPlus width="17" height="17" />Registrar movimiento</button>} />
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
    {modalAbierto && contexto.data && <RegistroMovimiento productos={contexto.data.productos} opciones={contexto.data.opciones}
      session={session} productoId={productoId} onProductoChange={setProductoId} onRegistrar={registrarMovimiento} onCerrar={() => setModalAbierto(false)} />}
  </div>
}
export default InventarioPanel
