import { IconSearch } from './icons'
import './ui.css'

// Campo de búsqueda por texto con su icono.
function Buscador({ valor, onChange, placeholder = 'Buscar...', etiqueta = 'Buscar' }) {
  return (
    <div className="ui__buscador">
      <IconSearch width="18" height="18" />
      <input
        type="search"
        placeholder={placeholder}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        aria-label={etiqueta}
      />
    </div>
  )
}

export default Buscador
