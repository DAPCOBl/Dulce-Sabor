import './ui.css'

// Migas de pan: sede actual y la sección visitada.
function Miga({ ruta, sede = 'Sede principal' }) {
  return (
    <nav className="ui__miga" aria-label="Ruta de navegación">
      <span>{sede}</span>
      {ruta && (
        <>
          <span className="ui__miga-sep">›</span>
          <span className="ui__miga-actual">{ruta}</span>
        </>
      )}
    </nav>
  )
}

export default Miga
