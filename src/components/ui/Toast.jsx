import './ui.css'

// Aviso flotante de confirmación. Se muestra unos segundos y desaparece.
function Toast({ mensaje, icono }) {
  if (!mensaje) return null

  return (
    <div className="ui__toast" role="status">
      {icono}
      {mensaje}
    </div>
  )
}

export default Toast
