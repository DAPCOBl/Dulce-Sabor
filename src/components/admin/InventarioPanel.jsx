import { useMemo, useState } from 'react'
import ExistenciasInventario from './ExistenciasInventario'
import InventarioKpis from './InventarioKpis'
import MovimientosRecientes from './MovimientosRecientes'
import RegistroMovimiento from './RegistroMovimiento'
import Cabecera from '../ui/Cabecera'
import { IconPlus } from '../ui/icons'
import { estadoDeInventario, registrarMovimiento, useEstado } from '../../services/estado'
import './inventario.css'

const POR_PAGINA = 6
const PRODUCTO_INICIAL = 'p13'

function InventarioPanel({ session }) {
  const { inventario, movimientos } = useEstado()
  const [filtros, setFiltros] = useState({ busqueda: '', categoria: 'todas', estado: 'todos' })
  const [pagina, setPagina] = useState(1)
  const [productoInicial, setProductoInicial] = useState(PRODUCTO_INICIAL)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [claveRegistro, setClaveRegistro] = useState(0)

  const productos = useMemo(
    () => inventario.map((producto) => ({ ...producto, estado: estadoDeInventario(producto) })),
    [inventario],
  )

  const filtrados = useMemo(() => {
    const texto = filtros.busqueda.trim().toLowerCase()

    return productos.filter((producto) => {
      const coincideTexto =
        texto === '' ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.sku.toLowerCase().includes(texto)
      const coincideCategoria =
        filtros.categoria === 'todas' || producto.categoria === filtros.categoria
      const coincideEstado = filtros.estado === 'todos' || producto.estado === filtros.estado

      return coincideTexto && coincideCategoria && coincideEstado
    })
  }, [productos, filtros])

  const paginas = Math.max(Math.ceil(filtrados.length / POR_PAGINA), 1)
  // La página se recorta al total filtrado para no quedar fuera de rango.
  const paginaActual = Math.min(pagina, paginas)
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  function cambiarFiltro(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }))
    setPagina(1)
  }

  function elegirProducto(producto) {
    setProductoInicial(producto.id)
    setModalAbierto(true)
    setClaveRegistro((contador) => contador + 1)
  }

  function activarRegistro() {
    setModalAbierto(true)
    setClaveRegistro((contador) => contador + 1)
  }

  function cerrarModal() {
    setModalAbierto(false)
    setProductoInicial(PRODUCTO_INICIAL)
  }

  function guardarMovimiento(datos) {
    return registrarMovimiento(datos)
  }

  return (
    <div className="admin__inventario">
      <Cabecera
        miga="Inventario"
        titulo="Cada pieza, en su lugar."
        subtitulo="Consulta existencias, atiende alertas y conserva la trazabilidad de cada movimiento."
        acciones={
          <button
            type="button"
            className="ui__boton ui__boton--primario"
            onClick={activarRegistro}
          >
            <IconPlus width="16" height="16" />
            Registrar movimiento
          </button>
        }
      />

      <InventarioKpis productos={productos} />

      <div className="admin__inventario-grid">
        <ExistenciasInventario
          productos={visibles}
          total={filtrados.length}
          porPagina={POR_PAGINA}
          filtros={filtros}
          onFiltro={cambiarFiltro}
          pagina={paginaActual}
          paginas={paginas}
          onPagina={setPagina}
          onElegir={elegirProducto}
        />

      </div>

      {modalAbierto && (
        <RegistroMovimiento
          key={claveRegistro}
          productos={productos}
          session={session}
          productoId={productoInicial}
          productoPorDefecto={PRODUCTO_INICIAL}
          onProductoChange={setProductoInicial}
          onRegistrar={guardarMovimiento}
          onCerrar={cerrarModal}
        />
      )}

      <MovimientosRecientes movimientos={movimientos} />
    </div>
  )
}

export default InventarioPanel
