import { useRef, useState } from 'react'
import ProductoEditor from '../../components/admin/ProductoEditor'
import ProductosTabla from '../../components/admin/ProductosTabla'
import Cabecera from '../../components/ui/Cabecera'
import { IconPlus } from '../../components/ui/icons'
import { useRemote } from '../../hooks/useRemote'
import RemoteStatus from '../../components/ui/RemoteStatus'
import {
  alternarEstadoProducto,
  actualizarProducto,
  crearProducto,
  listarProductos,
  opcionesProductos,
} from '../../services/productos'
import '../../components/admin/productos.css'

const POR_PAGINA = 6

const FILTROS_INICIALES = { busqueda: '', categoria: '', estado: '' }

function AdminProductos() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState(null)
  const [modo, setModo] = useState('editar')
  // El modal espera a que se pulse una acción: no se abre solo al entrar.
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [claveEditor, setClaveEditor] = useState(0)

  const remote = useRemote(async options => {
    const [lista, opciones] = await Promise.all([
      listarProductos({ ...filtros, pagina, porPagina: POR_PAGINA }, options), opcionesProductos(options),
    ])
    return { ...lista, opciones }
  }, [filtros, pagina])
  const productos = remote.data?.productos ?? []
  const seleccionado = productos.find(producto => producto.id === seleccionId) ?? null
  const hayFiltros = Boolean(filtros.busqueda || filtros.categoria || filtros.estado)
  const [error, setError] = useState('')
  const pendingRef = useRef(false)
  async function alternar(producto) {
    if (pendingRef.current) return
    pendingRef.current = true; setError('')
    try { await alternarEstadoProducto(producto) } catch (error) { setError(error.message) }
    finally { pendingRef.current = false }
  }

  function cambiarFiltros(nuevos) {
    setFiltros(nuevos)
    setPagina(1)
  }

  function abrir(producto, modoPanel) {
    setSeleccionId(producto.id)
    setModo(modoPanel)
    setPanelAbierto(true)
    setClaveEditor((clave) => clave + 1)
  }

  function crearNuevo() {
    setSeleccionId(null)
    setModo('nuevo')
    setPanelAbierto(true)
    setClaveEditor((clave) => clave + 1)
  }

  async function guardar(cambios) {
    if (modo === 'nuevo') await crearProducto(cambios)
    else if (seleccionado) await actualizarProducto(seleccionado.id, cambios)
    else return false
    setPanelAbierto(false)
    return true
  }

  function cancelar() {
    if (modo === 'nuevo') {
      setPanelAbierto(false)
      return
    }
    setClaveEditor((clave) => clave + 1)
  }

  function cerrar() {
    setPanelAbierto(false)
  }

  return (
    <div className="admin__productos">
      <Cabecera
        miga="Productos"
        titulo="Un catálogo bien cuidado."
        subtitulo="Administra tus productos y precios desde un mismo lugar."
        acciones={
          <button type="button" className="ui__boton ui__boton--primario" onClick={crearNuevo}>
            <IconPlus width="17" height="17" />
            Nuevo producto
          </button>
        }
      />



      <RemoteStatus {...remote} />
      {error && <p className="ui__request-error" role="alert">{error}</p>}
      {remote.data && <div className="admin__productos-cuerpo">
        <ProductosTabla
          filas={productos}
          paginacion={remote.data.paginacion}
          filtros={filtros}
          categorias={remote.data.opciones.categorias}
          hayFiltros={hayFiltros}
          onFiltros={cambiarFiltros}
          onPagina={setPagina}
          onEditar={(producto) => abrir(producto, 'editar')}
          onAlternar={alternar}
        />

        {panelAbierto && (
          <ProductoEditor
            key={`${modo}-${seleccionId ?? 'nuevo'}-${claveEditor}`}
            producto={seleccionado}
            modo={modo}
            categorias={remote.data.opciones.categorias}
            estados={remote.data.opciones.estados}
            catalogo={productos}
            onGuardar={guardar}
            onCancelar={cancelar}
            onCerrar={cerrar}
          />
        )}
      </div>}
    </div>
  )
}

export default AdminProductos
