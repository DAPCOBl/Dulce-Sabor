import './ui.css'

// Estado vacío: cuando un listado no tiene nada que mostrar.
function Vacio({ titulo, detalle, icono }) {
  return (
    <div className="ui__vacio">
      {icono}
      {titulo && <p className="ui__vacio-titulo">{titulo}</p>}
      {detalle && <p className="ui__vacio-detalle">{detalle}</p>}
    </div>
  )
}

export default Vacio
