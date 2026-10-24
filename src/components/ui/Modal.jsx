import { useEffect, useRef } from 'react'
import { IconClose } from './icons'
import './ui.css'

// Modal compartido: cierra con Escape o clic en el fondo, mueve el foco al
// panel y bloquea el scroll de la página mientras está abierto.
function Modal({
  onCerrar,
  titulo,
  subtitulo,
  icono,
  tono = 'neutro',
  ancho = false,
  acciones,
  accionesEnFila = false,
  children,
}) {
  const panelRef = useRef(null)
  const cerrarRef = useRef(onCerrar)

  useEffect(() => {
    cerrarRef.current = onCerrar
  })

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape') cerrarRef.current?.()
    }

    const scrollPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    panelRef.current?.focus()

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = scrollPrevio
    }
  }, [])

  const clases = ['ui__modal-panel']
  if (ancho) clases.push('ui__modal-panel--ancho')

  return (
    <div className="ui__modal" onClick={onCerrar}>
      <div
        ref={panelRef}
        className={clases.join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="ui__modal-cabecera">
          {icono && (
            <span
              className={`ui__modal-icono${tono === 'exito' ? ' ui__modal-icono--exito' : ''}`}
            >
              {icono}
            </span>
          )}

          <div className="ui__modal-intro">
            <h2 className="ui__modal-titulo">{titulo}</h2>
            {subtitulo && <p className="ui__modal-subtitulo">{subtitulo}</p>}
          </div>

          <button
            type="button"
            className="ui__modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <IconClose width="18" height="18" />
          </button>
        </header>

        {children && <div className="ui__modal-cuerpo">{children}</div>}

        {acciones && (
          <footer
            className={`ui__modal-acciones${accionesEnFila ? ' ui__modal-acciones--fila' : ''}`}
          >
            {acciones}
          </footer>
        )}
      </div>
    </div>
  )
}

// Bloque de datos etiqueta/valor (fecha, cajero, método de pago...).
export function ModalDatos({ children }) {
  return <div className="ui__modal-datos">{children}</div>
}

export function ModalFila({ etiqueta, children }) {
  return (
    <div className="ui__modal-fila">
      <span>{etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

// Lista de productos de una venta.
export function ModalItems({ items, renderDetalle, subtotales }) {
  return (
    <ul className="ui__modal-items">
      {items.map((item) => (
        <li key={item.id} className="ui__modal-item">
          <div className="ui__modal-item-info">
            <p className="ui__modal-item-nombre">{item.nombre}</p>
            <p className="ui__modal-item-detalle">{renderDetalle(item)}</p>
          </div>
          <strong className="ui__modal-item-subtotal">{subtotales(item)}</strong>
        </li>
      ))}
    </ul>
  )
}

export function ModalTotal({ etiqueta, children }) {
  return (
    <div className="ui__modal-total">
      <span>{etiqueta}</span>
      <strong>{children}</strong>
    </div>
  )
}

export default Modal
