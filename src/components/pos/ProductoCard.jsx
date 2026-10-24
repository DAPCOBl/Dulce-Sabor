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
        <img className="producto__foto" src={producto.imagen} alt={producto.nombre} loading="lazy" />
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
        {agotado ? 'No disponible' : '+'}
      </button>
    </article>
  )
}

export default ProductoCard
