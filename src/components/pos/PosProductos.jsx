import ProductoCard from './ProductoCard'
import Cabecera from '../ui/Cabecera'
import Buscador from '../ui/Buscador'
import Vacio from '../ui/Vacio'
import { IconEmptyCart, IconWarning } from '../ui/icons'

const CATEGORIAS = ['Todos', 'Pan dulce', 'Pasteles', 'Saldados', 'Bebidas']

function PosProductos({ filtrados, onAdd, busqueda, onBusqueda, categoria, onCategoria }) {
  return (
    <section className="pos__centro">
      <Cabecera
        miga="Registro de ventas"
        titulo="Registro de ventas"
        subtitulo="Un pedido más hecho con cariño."
      />

      <Buscador
        valor={busqueda}
        onChange={onBusqueda}
        placeholder="Buscar producto por nombre o código..."
        etiqueta="Buscar producto"
      />

      <div className="pos__categorias" role="tablist" aria-label="Categorías">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={categoria === cat}
            className={`pos__categoria${categoria === cat ? ' pos__categoria--activa' : ''}`}
            onClick={() => onCategoria(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="pos__productos">
        <div className="pos__productos-titulo">
          <h2>Favoritos de la casa</h2>
          <span className="pos__contador">{filtrados.length} productos</span>
        </div>

        {filtrados.length > 0 ? (
          <div className="pos__grid">
            {filtrados.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <Vacio
            icono={<IconEmptyCart width="34" height="34" />}
            titulo="No encontramos productos con ese criterio"
            detalle="Prueba con otra búsqueda o cambia de categoría."
          />
        )}
      </div>

      <div className="pos__aviso">
        <IconWarning width="18" height="18" />
        <p>
          El stock se valida al cobrar. Si un producto cambia de disponibilidad, te lo avisaremos antes de
          cerrar la venta.
        </p>
      </div>
    </section>
  )
}

export default PosProductos
