import { useMemo, useState } from 'react'
import ProductoEditor from '../../components/admin/ProductoEditor'
import ProductosTabla from '../../components/admin/ProductosTabla'
import Cabecera from '../../components/ui/Cabecera'
import { IconPlus } from '../../components/ui/icons'
import { CATEGORIAS, ESTADOS } from '../../data/productos'
import {
  alternarEstadoProducto,
  actualizarProducto,
  crearProducto,
  useCatalogo,
} from '../../services/estado'
import '../../components/admin/productos.css'

const POR_PAGINA = 6

const FILTROS_INICIALES = { busqueda: '', categoria: '', estado: '' }

function AdminProductos() {
  const productos = useCatalogo()
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState(null)
  const [modo, setModo] = useState('editar')
  // El modal espera a que se pulse una acción: no se abre solo al entrar.
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [claveEditor, setClaveEditor] = useState(0)

  const seleccionado = productos.find((producto) => producto.id === seleccionId) ?? null

  const filtrados = useMemo(() => {
    const busqueda = filtros.busqueda.trim().toLowerCase()

    return productos.filter((producto) => {
      if (busqueda) {
        const coincide =
          producto.nombre.toLowerCase().includes(busqueda) ||
          producto.sku.toLowerCase().includes(busqueda)
        if (!coincide) return false
      }
      if (filtros.categoria && producto.categoria !== filtros.categoria) return false
      if (filtros.estado && producto.estado !== filtros.estado) return false
      return true
    })
  }, [productos, filtros])

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, paginas)
  const desde = filtrados.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1
  const hasta = Math.min(paginaActual * POR_PAGINA, filtrados.length)
  const filas = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const hayFiltros = Boolean(filtros.busqueda || filtros.categoria || filtros.estado)

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

  function guardar(cambios) {
    if (modo === 'nuevo') {
      const nuevo = {
        ...cambios,
        id: cambios.sku.toLowerCase(),
        stock: 0,
        imagen: cambios.imagen,
      }
      crearProducto(nuevo)
      setSeleccionId(nuevo.id)
      setModo('editar')
      setPagina(1)
      setClaveEditor((clave) => clave + 1)
      return true
    }

    if (!seleccionado) return false
    actualizarProducto(seleccionado.id, cambios)
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



      <div className="admin__productos-cuerpo">
        <ProductosTabla
          filas={filas}
          paginacion={{ pagina: paginaActual, paginas, total: filtrados.length, desde, hasta }}
          filtros={filtros}
          categorias={CATEGORIAS}
          hayFiltros={hayFiltros}
          onFiltros={cambiarFiltros}
          onPagina={setPagina}
          onEditar={(producto) => abrir(producto, 'editar')}
          onAlternar={(producto) => alternarEstadoProducto(producto.id)}
        />

        {panelAbierto && (
          <ProductoEditor
            key={`${modo}-${seleccionId ?? 'nuevo'}-${claveEditor}`}
            producto={seleccionado}
            modo={modo}
            categorias={CATEGORIAS}
            estados={ESTADOS}
            catalogo={productos}
            onGuardar={guardar}
            onCancelar={cancelar}
            onCerrar={cerrar}
          />
        )}
      </div>
    </div>
  )
}

export default AdminProductos
