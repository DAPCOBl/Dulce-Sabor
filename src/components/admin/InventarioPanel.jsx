import { useMemo, useRef, useState } from 'react'
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
  const [activarForm, setActivarForm] = useState(0)

  const registroRef = useRef(null)

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
    setActivarForm((contador) => contador + 1)
    registroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function activarRegistro() {
    setActivarForm((contador) => contador + 1)
    registroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
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

        <div ref={registroRef}>
          <RegistroMovimiento
            productos={productos}
            session={session}
            productoId={productoInicial}
            productoPorDefecto={PRODUCTO_INICIAL}
            onProductoChange={setProductoInicial}
            activarForm={activarForm}
            onRegistrar={guardarMovimiento}
          />
        </div>
      </div>

      <MovimientosRecientes movimientos={movimientos} />

      <footer className="admin__prototipo">
        <p>
          <strong>Prototipo visual · Dulce Sabor</strong> · Módulo de inventario
        </p>
        <p>Las existencias se sincronizan con el punto de venta de la sede principal.</p>
      </footer>
    </div>
  )
}

export default InventarioPanel
