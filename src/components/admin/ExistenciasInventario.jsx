import Buscador from '../ui/Buscador'
import Paginacion from '../ui/Paginacion'
import { Select } from '../ui/Filtro'
import { CATEGORIAS_INVENTARIO } from '../../data/inventario'

const ESTADOS_FILTRO = [
  { id: 'todos', etiqueta: 'todos' },
  { id: 'disponible', etiqueta: 'Disponible' },
  { id: 'bajo', etiqueta: 'Bajo' },
  { id: 'agotado', etiqueta: 'Agotado' },
]

const OPCIONES_CATEGORIA = [
  { valor: 'todas', etiqueta: 'todas' },
  ...CATEGORIAS_INVENTARIO.map((categoria) => ({ valor: categoria, etiqueta: categoria })),
]

const OPCIONES_ESTADO = ESTADOS_FILTRO.map((estado) => ({
  valor: estado.id,
  etiqueta: estado.etiqueta,
}))

const ETIQUETA_ESTADO = {
  disponible: 'Disponible',
  bajo: 'Bajo',
  agotado: 'Agotado',
}

function ExistenciasInventario({
  productos,
  total,
  porPagina,
  filtros,
  onFiltro,
  pagina,
  paginas,
  onPagina,
  onElegir,
}) {
  const desde = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const hasta = Math.min(pagina * porPagina, total)

  return (
    <section className="admin__tarjeta">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Existencias actuales</h2>
          <p className="admin__tarjeta-sub">Control de stock por producto en sede principal</p>
        </div>
      </header>

      <div className="ui__filtros">
        <Buscador
          valor={filtros.busqueda}
          onChange={(valor) => onFiltro('busqueda', valor)}
          placeholder="Buscar por nombre o SKU..."
          etiqueta="Buscar producto por nombre o SKU"
        />

        <label className="admin__filtro-campo">
          <span className="admin__filtro-campo-label">Categoría:</span>
          <Select
            valor={filtros.categoria}
            onChange={(valor) => onFiltro('categoria', valor)}
            opciones={OPCIONES_CATEGORIA}
            ariaLabel="Filtrar por categoría"
          />
        </label>

        <label className="admin__filtro-campo">
          <span className="admin__filtro-campo-label">Estado:</span>
          <Select
            valor={filtros.estado}
            onChange={(valor) => onFiltro('estado', valor)}
            opciones={OPCIONES_ESTADO}
            ariaLabel="Filtrar por estado"
          />
        </label>
      </div>

      <div className="ui__tabla-wrap">
        <table className="ui__tabla">
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th>Stock actual</th>
              <th>Mínimo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id}>
                <td>
                  <button
                    type="button"
                    className="admin__producto-nombre"
                    onClick={() => onElegir(producto)}
                    title={`Registrar movimiento de ${producto.nombre}`}
                  >
                    {producto.nombre}
                  </button>
                </td>
                <td className="admin__sku">{producto.sku}</td>
                <td className="admin__celda-suave">{producto.categoria}</td>
                <td>
                  <span className="admin__stock">{producto.stock}</span>
                </td>
                <td>
                  <span className="admin__minimo">{producto.minimo}</span>
                </td>
                <td>
                  <span className={`admin__badge admin__badge--${producto.estado}`}>
                    {ETIQUETA_ESTADO[producto.estado]}
                  </span>
                </td>
              </tr>
            ))}

            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="admin__celda-vacia">
                  Ningún producto coincide con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="admin__paginacion">
        <Paginacion
          pagina={pagina}
          paginas={paginas}
          onPagina={onPagina}
          texto={`Mostrando ${desde}-${hasta} de ${total} productos`}
        />
      </footer>
    </section>
  )
}

export default ExistenciasInventario
