import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import { IconArrow, IconInfo, IconSuccess } from '../ui/icons'
import { movimientoPendiente } from '../../services/inventario'

const CANTIDAD_INICIAL = 12

function RegistroMovimiento({
  productos,
  session,
  productoId,
  cargandoProducto,
  opciones,
  onProductoChange,
  onRegistrar,
  onCerrar,
}) {
  const [pendiente, setPendiente] = useState(movimientoPendiente)
  const [tipo, setTipo] = useState(() => movimientoPendiente()?.body.tipo ?? 'entrada')
  const [cantidad, setCantidad] = useState(() => movimientoPendiente()?.body.cantidad ?? CANTIDAD_INICIAL)
  const [motivo, setMotivo] = useState(() => movimientoPendiente()?.body.motivo ?? opciones.motivosEntrada[0])
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)
  const pendingRef = useRef(false)
  const confirmadaRef = useRef(false)
  const [exito, setExito] = useState(null)

  const campoProductoRef = useRef(null)

  useEffect(() => {
    campoProductoRef.current?.focus()
  }, [])

  const productoActivoId = pendiente?.body.productoId ?? productoId
  const producto = productos.find((item) => item.id === productoActivoId) ?? (pendiente ? null : productos[0])
  const stockActual = producto?.stock ?? 0
  const unidades = Math.max(Math.round(Number(cantidad) || 0), 0)
  const nuevoStock = tipo === 'entrada' ? stockActual + unidades : unidades
  const motivos = tipo === 'entrada' ? opciones.motivosEntrada : opciones.motivosAjuste

  function cambiarTipo(siguiente) {
    if (guardando || pendiente) return
    confirmadaRef.current = false
    setTipo(siguiente)
    setMotivo(siguiente === 'entrada' ? opciones.motivosEntrada[0] : opciones.motivosAjuste[0])
    setCantidad(siguiente === 'entrada' ? CANTIDAD_INICIAL : stockActual)
    setExito(null)
  }

  async function elegirProducto(id) {
    if (guardando || pendiente) return
    confirmadaRef.current = false
    const seleccionado = await onProductoChange(id)
    if (tipo === 'ajuste' && seleccionado) setCantidad(seleccionado.stock)
    setExito(null)
  }

  async function guardar(evento) {
    evento.preventDefault()
    if (pendingRef.current || confirmadaRef.current) return
    setError('')
    setExito(null)
    const numero = Number(cantidad)
    if (!pendiente && (String(cantidad).trim() === '' || !Number.isSafeInteger(numero) || numero < (tipo === 'entrada' ? 1 : 0) || numero > 2147483647)) {
      setError('Escribe una cantidad entera válida.')
      return
    }
    const body = pendiente?.body ?? { productoId, cantidad: numero, tipo, motivo }
    pendingRef.current = true
    setGuardando(true)
    try {
      const movimiento = await onRegistrar(body)
      setPendiente(movimientoPendiente())
      if (!movimiento) return
      confirmadaRef.current = true
      setExito(movimiento)
      setCantidad(body.tipo === 'entrada' ? CANTIDAD_INICIAL : movimiento.saldo)
    } catch (error) {
      setPendiente(movimientoPendiente())
      setError(error.message)
    } finally {
      pendingRef.current = false
      setGuardando(false)
    }
  }

  function editarCantidad(valor) {
    if (guardando || pendiente) return
    confirmadaRef.current = false
    setExito(null)
    setCantidad(valor)
  }

  function editarMotivo(valor) {
    if (guardando || pendiente) return
    confirmadaRef.current = false
    setExito(null)
    setMotivo(valor)
  }

  function prepararOtro() {
    if (guardando || pendiente) return
    confirmadaRef.current = false
    setExito(null)
    setError('')
  }

  function cancelar() {
    if (guardando || pendiente) return
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
          disabled={guardando || Boolean(pendiente) || cargandoProducto}
          aria-selected={tipo === 'entrada'}
          className={`admin__tab${tipo === 'entrada' ? ' admin__tab--activa' : ''}`}
          onClick={() => cambiarTipo('entrada')}
        >
          Entrada
        </button>
        <button
          type="button"
          role="tab"
          disabled={guardando || Boolean(pendiente) || cargandoProducto}
          aria-selected={tipo === 'ajuste'}
          className={`admin__tab${tipo === 'ajuste' ? ' admin__tab--activa' : ''}`}
          onClick={() => cambiarTipo('ajuste')}
        >
          Ajuste
        </button>
      </div>

      {pendiente && <p className="ui__request-error" role="alert">Hay un movimiento pendiente de confirmar. Reintenta exactamente ese movimiento para consultar su resultado sin duplicarlo.</p>}
      {error && <p className="ui__request-error" role="alert">{error}</p>}
      <form className="admin__form" onSubmit={guardar}>
        <fieldset className="ui__fieldset" disabled={guardando || Boolean(pendiente) || cargandoProducto}>
        <label className="admin__campo">
          <span className="admin__campo-label">Producto</span>
          <select
            aria-label="Producto"
            ref={campoProductoRef}
            className="admin__control admin__select"
            value={productoActivoId}
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
              onChange={(evento) => editarCantidad(evento.target.value)}
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
            onChange={(evento) => editarMotivo(evento.target.value)}
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

        {!pendiente && <div className="admin__cambio">
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
        </div>}

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

        {!pendiente && <div className="admin__acciones-panel">
          <button type="button" className="ui__boton ui__boton--secundario" onClick={cancelar}>
            Cancelar
          </button>
          {exito ? <button type="button" className="ui__boton ui__boton--primario" onClick={prepararOtro}>Registrar otro movimiento</button>
            : <button disabled={guardando} type="submit" className="ui__boton ui__boton--primario">
              {guardando ? 'Guardando…' : tipo === 'entrada' ? 'Guardar entrada' : 'Guardar ajuste'}
            </button>}
        </div>}
        </fieldset>
        {pendiente && <button disabled={guardando} type="submit" className="ui__boton ui__boton--primario">{guardando ? 'Confirmando…' : 'Confirmar movimiento pendiente'}</button>}
      </form>
    </Modal>
  )
}

export default RegistroMovimiento
