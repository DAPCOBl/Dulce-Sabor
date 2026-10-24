import { IconChevronDer, IconChevronIzq } from './icons'
import './ui.css'

// Paginador: muestra la primera y la última página, las vecinas de la actual
// y puntos suspensivos cuando hay huecos entre ellas.
function paginasVisibles(paginas, actual) {
  if (paginas <= 7) {
    return Array.from({ length: paginas }, (_, indice) => indice + 1)
  }

  const numeros = new Set([1, paginas])
  for (let numero = actual - 1; numero <= actual + 1; numero += 1) {
    if (numero > 1 && numero < paginas) numeros.add(numero)
  }

  const ordenados = [...numeros].sort((a, b) => a - b)
  const visibles = []

  ordenados.forEach((numero, indice) => {
    const anterior = ordenados[indice - 1]
    if (anterior && numero - anterior > 1) visibles.push('…')
    visibles.push(numero)
  })

  return visibles
}

function Paginacion({ pagina, paginas, onPagina, texto, extra }) {
  return (
    <div className="ui__paginacion">
      {texto && <p className="ui__paginacion-texto">{texto}</p>}

      <div className="ui__paginacion-derecha">
        <div className="ui__paginacion-controles">
          <button
            type="button"
            className="ui__pagina ui__pagina--flecha"
            onClick={() => onPagina(pagina - 1)}
            disabled={pagina <= 1}
            aria-label="Página anterior"
          >
            <IconChevronIzq width="16" height="16" />
          </button>

          {paginasVisibles(paginas, pagina).map((numero) =>
            numero === '…' ? (
              <span key="puntos" className="ui__pagina-puntos">
                …
              </span>
            ) : (
              <button
                key={numero}
                type="button"
                className={`ui__pagina${numero === pagina ? ' ui__pagina--activa' : ''}`}
                onClick={() => onPagina(numero)}
                aria-current={numero === pagina ? 'page' : undefined}
              >
                {numero}
              </button>
            ),
          )}

          <button
            type="button"
            className="ui__pagina ui__pagina--flecha"
            onClick={() => onPagina(pagina + 1)}
            disabled={pagina >= paginas}
            aria-label="Página siguiente"
          >
            <IconChevronDer width="16" height="16" />
          </button>
        </div>

        {extra}
      </div>
    </div>
  )
}

export default Paginacion
