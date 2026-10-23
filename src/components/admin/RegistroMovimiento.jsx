import { useEffect, useRef, useState } from 'react'
import { IconArrow, IconInfo, IconSuccess } from '../ui/icons'
import { MOTIVOS_AJUSTE, MOTIVOS_ENTRADA, RESPONSABLES_INVENTARIO } from '../../data/inventario'

const CANTIDAD_INICIAL = 12

function RegistroMovimiento({
  productos,
  session,
  productoId,
  productoPorDefecto,
  onProductoChange,
  activarForm,
  onRegistrar,
}) {
  const [tipo, setTipo] = useState('entrada')
  const [cantidad, setCantidad] = useState(CANTIDAD_INICIAL)
  const [motivo, setMotivo] = useState(MOTIVOS_ENTRADA[0])
  const [responsable, setResponsable] = useState(session.user.nombre)
  const [exito, setExito] = useState(null)

  const campoProductoRef = useRef(null)

  useEffect(() => {
    if (activarForm > 0) campoProductoRef.current?.focus()
  }, [activarForm])

  const producto = productos.find((item) => item.id === productoId) ?? productos[0]
  const stockActual = producto?.stock ?? 0
  const unidades = Math.max(Math.round(Number(cantidad) || 0), 0)
  const nuevoStock = tipo === 'entrada' ? stockActual + unidades : unidades
  const motivos = tipo === 'entrada' ? MOTIVOS_ENTRADA : MOTIVOS_AJUSTE

  function cambiarTipo(siguiente) {
    setTipo(siguiente)
    setMotivo(siguiente === 'entrada' ? MOTIVOS_ENTRADA[0] : MOTIVOS_AJUSTE[0])
    setCantidad(siguiente === 'entrada' ? CANTIDAD_INICIAL : stockActual)
    setExito(null)
  }

  function elegirProducto(id) {
    onProductoChange(id)
    setExito(null)
  }

  function guardar(evento) {
    evento.preventDefault()
    const movimiento = onRegistrar({
      productoId,
      cantidad: unidades,
      tipo,
      motivo,
      responsable,
    })

    if (!movimiento) return

    setExito({ ...movimiento, stockAnterior: stockActual })
    setCantidad(tipo === 'entrada' ? CANTIDAD_INICIAL : movimiento.saldo)
  }

  function cancelar() {
    onProductoChange(productoPorDefecto)
    setCantidad(CANTIDAD_INICIAL)
    setMotivo(tipo === 'entrada' ? MOTIVOS_ENTRADA[0] : MOTIVOS_AJUSTE[0])
    setExito(null)
  }

  return (
    <section className="admin__tarjeta admin__registro">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">
            {tipo === 'entrada' ? 'Registrar entrada' : 'Registrar ajuste'}
          </h2>
          <p className="admin__tarjeta-sub">
            {tipo === 'entrada'
              ? 'Suma existencias de producción o proveedor'
              : 'Corrige el stock con el conteo físico'}
          </p>
        </div>
        <span className="admin__borrador">Borrador</span>
      </header>

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

      <form className="admin__form" onSubmit={guardar}>
        <label className="admin__campo">
          <span className="admin__campo-label">Producto</span>
          <select
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
          <select
            className="admin__control admin__select"
            value={responsable}
            onChange={(evento) => setResponsable(evento.target.value)}
          >
            {RESPONSABLES_INVENTARIO.map((opcion) => (
              <option key={opcion} value={opcion}>
                {opcion}
              </option>
            ))}
          </select>
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
          <button type="submit" className="ui__boton ui__boton--primario">
            {tipo === 'entrada' ? 'Guardar entrada' : 'Guardar ajuste'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default RegistroMovimiento
