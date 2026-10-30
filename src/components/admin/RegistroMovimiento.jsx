import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import { IconArrow, IconInfo, IconSuccess } from '../ui/icons'

const CANTIDAD_INICIAL = 12

function RegistroMovimiento({
  productos,
  session,
  productoId,
  opciones,
  onProductoChange,
  onRegistrar,
  onCerrar,
}) {
  const [tipo, setTipo] = useState('entrada')
  const [cantidad, setCantidad] = useState(CANTIDAD_INICIAL)
  const [motivo, setMotivo] = useState(opciones.motivosEntrada[0])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const pendingRef = useRef(false)
  const [exito, setExito] = useState(null)

  const campoProductoRef = useRef(null)

  useEffect(() => {
    campoProductoRef.current?.focus()
  }, [])

  const producto = productos.find((item) => item.id === productoId) ?? productos[0]
  const stockActual = producto?.stock ?? 0
  const unidades = Math.max(Math.round(Number(cantidad) || 0), 0)
  const nuevoStock = tipo === 'entrada' ? stockActual + unidades : unidades
  const motivos = tipo === 'entrada' ? opciones.motivosEntrada : opciones.motivosAjuste

  function cambiarTipo(siguiente) {
    if (guardando) return
    setTipo(siguiente)
    setMotivo(siguiente === 'entrada' ? opciones.motivosEntrada[0] : opciones.motivosAjuste[0])
    setCantidad(siguiente === 'entrada' ? CANTIDAD_INICIAL : stockActual)
    setExito(null)
  }

  function elegirProducto(id) {
    if (guardando) return
    if (tipo === 'ajuste') setCantidad(productos.find(item => item.id === id)?.stock ?? 0)
    onProductoChange(id)
    setExito(null)
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (pendingRef.current) return
    setError('')
    const numero = Number(cantidad)
    if (String(cantidad).trim() === '' || !Number.isInteger(numero) || numero < (tipo === 'entrada' ? 1 : 0)) { setError('Escribe una cantidad entera válida.'); return }
    pendingRef.current = true; setGuardando(true)
    try {
    const movimiento = await onRegistrar({
      productoId,
      cantidad: numero,
      tipo,
      motivo,
    })

    if (!movimiento) return

    setExito(movimiento)
    setCantidad(tipo === 'entrada' ? CANTIDAD_INICIAL : movimiento.saldo)
    } catch (error) { setError(error.message) }
    finally { pendingRef.current = false; setGuardando(false) }
  }

  function cancelar() {
    setCantidad(CANTIDAD_INICIAL)
    setMotivo(tipo === 'entrada' ? opciones.motivosEntrada[0] : opciones.motivosAjuste[0])
    setExito(null)
    if (!guardando) onCerrar?.()
  }

  return (
    <Modal
      onCerrar={() => { if (!guardando) onCerrar() }}
      titulo={tipo === 'entrada' ? 'Registrar entrada' : 'Registrar ajuste'}
      subtitulo={
        tipo === 'entrada'
          ? 'Suma existencias de producción o proveedor'
          : 'Corrige el stock con el conteo físico'
      }
    >
      <div className="admin__modal-borrador">
        <span className="admin__borrador">Borrador</span>
      </div>

      <div className="admin__tabs" role="tablist" aria-label="Tipo de movimiento">
        <button
          type="button"
          role="tab"
          aria-selected={tipo === 'entrada'}
          className={`admin__tab${tipo === 'entrada' ? ' admin__tab--activa' : ''}`}
          onClick={() => cambiarTipo('entrada')}
        >
          Entrada
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tipo === 'ajuste'}
          className={`admin__tab${tipo === 'ajuste' ? ' admin__tab--activa' : ''}`}
          onClick={() => cambiarTipo('ajuste')}
        >
          Ajuste
        </button>
      </div>

      {error && <p className="ui__request-error" role="alert">{error}</p>}
      <form className="admin__form" onSubmit={guardar}>
        <fieldset className="ui__fieldset" disabled={guardando}>
        <label className="admin__campo">
          <span className="admin__campo-label">Producto</span>
          <select
            aria-label="Producto"
            ref={campoProductoRef}
            className="admin__control admin__select"
            value={productoId}
            onChange={(evento) => elegirProducto(evento.target.value)}
          >
            {productos.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre} · {item.sku}
              </option>
            ))}
          </select>
        </label>

        <div className="admin__campo-par">
          <label className="admin__campo">
            <span className="admin__campo-label">Cantidad</span>
            <input
              className="admin__control"
              aria-label="Cantidad"
              type="number"
              min="0"
              step="1"
              value={cantidad}
              onChange={(evento) => setCantidad(evento.target.value)}
            />
          </label>

          <label className="admin__campo">
            <span className="admin__campo-label">Unidades</span>
            <input className="admin__control" type="text" value="unidades" disabled />
          </label>
        </div>

        <label className="admin__campo">
          <span className="admin__campo-label">Motivo</span>
          <select
            className="admin__control admin__select"
            aria-label="Motivo"
            value={motivo}
            onChange={(evento) => setMotivo(evento.target.value)}
          >
            {motivos.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
        </label>

        <label className="admin__campo">
          <span className="admin__campo-label">Responsable</span>
          <input className="admin__control" value={session.user.nombre} readOnly />
        </label>

        <div className="admin__cambio">
          <div className="admin__cambio-valor">
            <span className="admin__cambio-numero">{stockActual}</span>
            <span className="admin__cambio-etiqueta">Stock actual</span>
          </div>

          <IconArrow className="admin__cambio-flecha" width="20" height="20" />

          <div className="admin__cambio-valor admin__cambio-valor--nuevo">
            <span className="admin__cambio-numero">
              {nuevoStock} <em>unidades</em>
            </span>
            <span className="admin__cambio-etiqueta">
              {tipo === 'entrada' ? 'Después de guardar' : 'Conteo final'}
            </span>
          </div>
        </div>

        {exito ? (
          <p className="admin__exito">
            <IconSuccess width="16" height="16" />
            <span>
              {exito.referencia} registrada: {exito.producto} pasó de {exito.stockAnterior} a{' '}
              {exito.saldo} unidades.
            </span>
          </p>
        ) : (
          <p className="admin__aviso">
            <IconInfo width="16" height="16" />
            <span>
              El movimiento queda trazado con hora, referencia y responsable. Las
              entradas se reflejan de inmediato en el punto de venta.
            </span>
          </p>
        )}

        <div className="admin__acciones-panel">
          <button type="button" className="ui__boton ui__boton--secundario" onClick={cancelar}>
            Cancelar
          </button>
          <button disabled={guardando} type="submit" className="ui__boton ui__boton--primario">
            {guardando ? 'Guardando…' : tipo === 'entrada' ? 'Guardar entrada' : 'Guardar ajuste'}
          </button>
        </div>
        </fieldset>
      </form>
    </Modal>
  )
}

export default RegistroMovimiento
