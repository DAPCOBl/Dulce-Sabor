import './ui.css'

// Filtro desplegable con etiqueta visible: el <select> real va por encima
// para que se use el control nativo, pero el diseño lo pone la etiqueta.
function Filtro({ icono, etiqueta, valor, onChange, opciones, ariaLabel }) {
  return (
    <label className="ui__filtro">
      {icono}
      {etiqueta}
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        aria-label={ariaLabel ?? etiqueta}
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </label>
  )
}

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

// Filtro de fecha: la píldora muestra el día elegido y el calendario nativo
// queda superpuesto para que se pueda cambiar.
function FiltroFecha({ icono, valor, onChange, texto, ariaLabel = 'Seleccionar fecha' }) {
  return (
    <label className="ui__filtro">
      {icono}
      {texto}
      <input
        type="date"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        aria-label={ariaLabel}
      />
    </label>
  )
}

export { Select, FiltroFecha }
export default Filtro
