import Buscador from '../ui/Buscador'
import Paginacion from '../ui/Paginacion'
import Vacio from '../ui/Vacio'
import { Select } from '../ui/Filtro'
import { IconClose, IconDesactivar, IconEditar } from '../ui/icons'
import { moneda } from '../ui/format'

const OPCIONES_CATEGORIA = [{ valor: '', etiqueta: 'Todas las categorías' }]

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Estado: todos' },
  { valor: 'Activo', etiqueta: 'Estado: activos' },
  { valor: 'Inactivo', etiqueta: 'Estado: inactivos' },
]

function ProductosTabla({
  filas,
  paginacion,
  filtros,
  categorias,
  hayFiltros,
  onFiltros,
  onPagina,
  onEditar,
  onAlternar,
}) {
  const { pagina, paginas, total, desde, hasta } = paginacion

  function actualizarFiltro(campo, valor) {
    onFiltros({ ...filtros, [campo]: valor })
  }

  return (
    <section className="admin__tarjeta admin__catalogo">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Productos</h2>
          <p className="admin__tarjeta-sub">
            Precios y disponibilidad del catálogo · {total} productos
          </p>
        </div>
      </header>

      <div className="ui__filtros">
        <Buscador
          valor={filtros.busqueda}
          onChange={(valor) => actualizarFiltro('busqueda', valor)}
          placeholder="Buscar por nombre o SKU..."
          etiqueta="Buscar producto por nombre o SKU"
        />

        <Select
          valor={filtros.categoria}
          onChange={(valor) => actualizarFiltro('categoria', valor)}
          opciones={[
            ...OPCIONES_CATEGORIA,
            ...categorias.map((categoria) => ({ valor: categoria, etiqueta: categoria })),
          ]}
          ariaLabel="Filtrar por categoría"
        />

        <Select
          valor={filtros.estado}
          onChange={(valor) => actualizarFiltro('estado', valor)}
          opciones={OPCIONES_ESTADO}
          ariaLabel="Filtrar por estado"
        />

        <button
          type="button"
          className="ui__enlace admin__limpiar"
          onClick={() => onFiltros({ busqueda: '', categoria: '', estado: '' })}
          disabled={!hayFiltros}
        >
          <IconClose width="14" height="14" />
          Limpiar filtros
        </button>
      </div>

      {filas.length > 0 ? (
        <div className="ui__tabla-wrap">
          <table className="ui__tabla ui__tabla--productos">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col" className="admin__col-producto">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col" className="admin__col-precio">
                  Precio
                </th>
                <th scope="col" className="admin__col-precio">
                  Coste
                </th>
                <th scope="col">Estado</th>
                <th scope="col" className="admin__col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((producto) => {
                const inactivo = producto.estado !== 'Activo'

                return (
                  <tr key={producto.id}>
                    <td className="admin__sku">{producto.sku}</td>
                    <td className="admin__col-producto">
                      <div className="admin__producto">
                        <span className="admin__producto-nombre">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="admin__celda-suave">{producto.categoria}</td>
                    <td className="admin__col-precio">
                      <span className="admin__precio">{moneda(producto.precio)}</span>
                    </td>
                    <td className="admin__col-precio">
                      <span className="admin__precio">{moneda(producto.coste ?? 0)}</span>
                    </td>
                    <td>
                      <span
                        className={`admin__estado${inactivo ? ' admin__estado--inactivo' : ''}`}
                      >
                        <span className="admin__estado-punto" />
                        {producto.estado}
                      </span>
                    </td>
                    <td className="admin__col-acciones">
                      <div className="admin__acciones-fila">
                        <button
                          type="button"
                          className="admin__accion"
                          onClick={(evento) => {
                            evento.stopPropagation()
                            onEditar(producto)
                          }}
                          aria-label={`Editar ${producto.nombre}`}
                          title="Editar"
                        >
                          <IconEditar width="17" height="17" />
                        </button>
                        <button
                          type="button"
                          className={`admin__accion${inactivo ? ' admin__accion--activar' : ' admin__accion--desactivar'}`}
                          onClick={(evento) => {
                            evento.stopPropagation()
                            onAlternar(producto)
                          }}
                          aria-label={
                            inactivo
                              ? `Activar ${producto.nombre}`
                              : `Desactivar ${producto.nombre}`
                          }
                          title={inactivo ? 'Activar' : 'Desactivar'}
                        >
                          <IconDesactivar width="17" height="17" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Vacio
          titulo="Sin resultados"
          detalle="Ningún producto coincide con los filtros aplicados. Prueba con otro nombre o limpia los filtros."
        />
      )}

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

export default ProductosTabla
