import { IconoProducto } from '../ui/ProductoThumb'
import { IconPlus } from '../ui/icons'

function ProductoCard({ producto, onAdd }) {
  const agotado = producto.stock <= 0
  const bajo = !agotado && producto.stock <= producto.stockMinimo

  const claseStock = agotado
    ? 'producto__stock--agotado'
    : bajo
      ? 'producto__stock--bajo'
      : ''

  return (
    <article className={`producto${agotado ? ' producto--agotado' : ''}`}>
      <div className="producto__imagen">
        {producto.imagen ? (
          <img className="producto__foto" src={producto.imagen} alt={producto.nombre} loading="lazy" />
        ) : (
          <IconoProducto categoria={producto.categoria} width="44" height="44" />
        )}
      </div>

      <div className="producto__info">
        <h3 className="producto__nombre">{producto.nombre}</h3>
        <div className="producto__meta">
          <span className="producto__precio">{producto.precioTexto}</span>
          <span className={`producto__stock ${claseStock}`}>
            {agotado ? 'Agotado' : `${producto.stock} disp.`}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="producto__add"
        onClick={() => onAdd(producto)}
        disabled={agotado}
        aria-label={agotado ? `${producto.nombre} agotado` : `Agregar ${producto.nombre}`}
      >
        {agotado ? 'No disponible' : <IconPlus width="18" height="18" />}
      </button>
    </article>
  )
}

export default ProductoCard
