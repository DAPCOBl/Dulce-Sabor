import { useEffect, useRef } from 'react'
import { moneda } from '../ui/format'

function milesCorto(valor) {
  const miles = valor / 1000
  return `${Number.isInteger(miles) ? miles : miles.toFixed(1)} mil`
}

function GraficoVentas({ serie, total, rango = 'Rango seleccionado' }) {
  const denso = serie.length > 14
  const maximo = Math.max(...serie.map((punto) => punto.valor), 1)
  const escala = Math.max(Math.ceil(maximo / 1000) * 1000, 1000)
  const resumen = serie.map((punto) => `${punto.etiqueta}: ${moneda(punto.valor)}`).join(', ')
  const contenedorRef = useRef(null)

  useEffect(() => {
    const contenedor = contenedorRef.current
    if (!contenedor || !denso) return
    contenedor.scrollLeft = contenedor.scrollWidth
  }, [denso, serie])

  return (
    <section className="admin__tarjeta admin__grafico">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Así van tus ventas</h2>
          <p className="admin__tarjeta-sub">Ingresos diarios · COP</p>
        </div>

        <span className="admin__grafico-rango">{rango}</span>
      </header>

      <div className="admin__grafico-cuerpo">
        <div className="admin__grafico-eje" aria-hidden="true">
          <span>{milesCorto(escala)}</span>
          <span>{milesCorto(escala / 2)}</span>
          <span>0</span>
        </div>

        <div
          ref={contenedorRef}
          className={`admin__grafico-barras${denso ? " admin__grafico-barras--denso" : ""}`}
          role="img"
          aria-label={`Ingresos del rango ${rango}. ${resumen}`}
        >
          {serie.map((punto, indice) => {
            const esActual = indice === serie.length - 1
            const alto = punto.valor > 0
              ? Math.max(Math.round((punto.valor / escala) * 100), 6)
              : 2
            return (
              <div
                key={punto.fecha}
                className={`admin__barra${esActual ? ' admin__barra--actual' : ''}`}
                title={`${punto.etiqueta}: ${moneda(punto.valor)} COP`}
              >
                <div className="admin__barra-pista">
                  <div
                    className="admin__barra-fill"
                    style={{ height: `${alto}%` }}
                  />
                  <span
                    className="admin__barra-tooltip"
                    role="tooltip"
                    style={{ bottom: '76%' }}
                  >
                    {moneda(punto.valor)}
                    <em>COP</em>
                  </span>
                </div>

                <span className="admin__barra-etiqueta">{punto.etiqueta}</span>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="admin__grafico-pie">
        <span>Total del rango</span>
        <strong>
          {moneda(total)}
          <em>COP</em>
        </strong>
      </footer>
    </section>
  )
}

export default GraficoVentas
