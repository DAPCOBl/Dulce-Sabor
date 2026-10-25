import { IconArrow, IconCash, IconCard, IconEmptyCart, IconMinus, IconPlus, IconSuccess, IconTrash } from '../ui/icons'
import { moneda } from '../ui/format'
import { subtotalDe } from '../../data/precios'

function PosResumen({
  carrito,
  onCantidad,
  onVaciar,
  metodoPago,
  onMetodo,
  recibido,
  onRecibido,
  total,
  cambio,
  onCobrar,
  efectivoInsuficiente,
  faltante,
}) {
  const recibidoConError = efectivoInsuficiente && recibido.trim() !== ''

  return (
    <aside className="pos__resumen">
      <header className="pos__resumen-header">
        <h2>Venta actual</h2>
        <button
          type="button"
          className="pos__icon-btn"
          onClick={onVaciar}
          disabled={carrito.length === 0}
          aria-label="Vaciar venta"
        >
          <IconTrash width="18" height="18" />
        </button>
      </header>

      <div className="pos__resumen-lista">
        {carrito.length === 0 ? (
          <div className="pos__carrito-vacio">
            <IconEmptyCart width="32" height="32" />
            <p>Aún no agregaste productos.</p>
            <span>Usá la cuadrícula o la búsqueda para comenzar.</span>
          </div>
        ) : (
          carrito.map((item) => (
            <article key={item.id} className="item">
              <div className="item__info">
                <h3 className="item__nombre">{item.nombre}</h3>
                <p className="item__unidad">
                  {moneda(item.precio)} · unidad
                </p>
              </div>

              <div className="item__acciones">
                <div className="item__cantidad">
                  <button
                    type="button"
                    onClick={() => onCantidad(item.id, -1)}
                    aria-label={`Quitar una unidad de ${item.nombre}`}
                  >
                    <IconMinus width="14" height="14" />
                  </button>
                  <span>{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => onCantidad(item.id, 1)}
                    aria-label={`Agregar una unidad de ${item.nombre}`}
                  >
                    <IconPlus width="14" height="14" />
                  </button>
                </div>
                <p className="item__subtotal">{moneda(subtotalDe(item))}</p>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="pos__resumen-pie">
        <div className="pos__totales">
          <div className="pos__total-linea pos__total-linea--grande">
            <span>Total a cobrar</span>
            <span className="pos__total-valor">
              {moneda(total)} <em>COP</em>
            </span>
          </div>
        </div>

        <div className="pos__pagos" role="tablist" aria-label="Método de pago">
          <button
            type="button"
            role="tab"
            aria-selected={metodoPago === 'efectivo'}
            className={`pos__pago${metodoPago === 'efectivo' ? ' pos__pago--activo' : ''}`}
            onClick={() => onMetodo('efectivo')}
          >
            <IconCash width="17" height="17" />
            Efectivo
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={metodoPago === 'tarjeta'}
            className={`pos__pago${metodoPago === 'tarjeta' ? ' pos__pago--activo' : ''}`}
            onClick={() => onMetodo('tarjeta')}
          >
            <IconCard width="17" height="17" />
            Tarjeta
          </button>
        </div>

        {metodoPago === 'efectivo' && (
          <>
            <label className="pos__recibido">
              <span>Dinero recibido · COP</span>
              <div className={`pos__recibido-campo${recibidoConError ? ' pos__recibido-campo--error' : ''}`}>
                <span>$</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  inputMode="decimal"
                  value={recibido}
                  onChange={(event) => onRecibido(event.target.value)}
                  placeholder="20.000"
                />
              </div>
              {efectivoInsuficiente && (
                <div className={`pos__recibido-hint${recibidoConError ? ' pos__recibido-hint--error' : ''}`}>
                  {recibidoConError ? `Faltan ${moneda(faltante)}` : `Ingresá al menos ${moneda(total)}`}
                </div>
              )}
            </label>

            <div className={`pos__cambio${cambio > 0 ? ' pos__cambio--ok' : ''}`}>
              <span>
                <IconSuccess width="17" height="17" />
                Cambio a entregar
              </span>
              <strong>{moneda(cambio)}</strong>
            </div>
          </>
        )}

        <button
          type="button"
          className="pos__cobrar"
          onClick={onCobrar}
          disabled={carrito.length === 0 || (efectivoInsuficiente && metodoPago === 'efectivo')}
        >
          Cobrar {moneda(total)}
          <IconArrow width="18" height="18" />
        </button>
      </div>
    </aside>
  )
}

export default PosResumen
