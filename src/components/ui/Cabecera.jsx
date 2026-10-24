import Miga from './Miga'
import './ui.css'

// Cabecera unificada: miga de pan, título, bajada y acciones a la derecha.
function Cabecera({ titulo, subtitulo, acciones, miga, sede = 'Sede principal' }) {
  const rutaMiga = miga

  return (
    <header className="ui__cabecera">
      <div className="ui__cabecera-texto">
        {miga && <Miga ruta={rutaMiga} sede={sede} />}
        {titulo && <h1 className="ui__titulo">{titulo}</h1>}
        {subtitulo && <p className="ui__subtitulo">{subtitulo}</p>}
      </div>

      {acciones && <div className="ui__acciones">{acciones}</div>}
    </header>
  )
}

export default Cabecera
