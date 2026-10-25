import './ui.css'

// Desplegable sin etiqueta, para filtros dentro de un formulario.
function Select({ valor, onChange, opciones, ariaLabel, className = '' }) {
  return (
    <select
      className={`ui__select ${className}`.trim()}
      value={valor}
      onChange={(evento) => onChange(evento.target.value)}
      aria-label={ariaLabel}
    >
      {opciones.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor}>
          {opcion.etiqueta}
        </option>
      ))}
    </select>
  )
}

export { Select }
