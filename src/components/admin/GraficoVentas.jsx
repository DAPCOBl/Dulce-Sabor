import { moneda } from '../ui/format'

function milesCorto(valor) {
  const miles = valor / 1000
  return `${Number.isInteger(miles) ? miles : miles.toFixed(1)} mil`
}

function GraficoVentas({ serie, total }) {
  const maximo = Math.max(...serie.map((punto) => punto.valor), 1)
  const escala = Math.max(Math.ceil(maximo / 1000) * 1000, 1000)
  const resumen = serie.map((punto) => `${punto.etiqueta}: ${moneda(punto.valor)}`).join(', ')

  return (
    <section className="admin__tarjeta admin__grafico">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Así van tus ventas</h2>
          <p className="admin__tarjeta-sub">Ingresos diarios · COP</p>
        </div>

        <span className="admin__grafico-rango">Últimos 7 días</span>
      </header>

      <div className="admin__grafico-cuerpo">
        <div className="admin__grafico-eje" aria-hidden="true">
          <span>{milesCorto(escala)}</span>
          <span>{milesCorto(escala / 2)}</span>
          <span />
        </div>

        <div
          className="admin__grafico-barras"
          role="img"
          aria-label={`Ingresos de los últimos 7 días. ${resumen}`}
        >
          {serie.map((punto, indice) => {
            const esActual = indice === serie.length - 1
            const alto = Math.max(Math.round((punto.valor / escala) * 100), 4)
            return (
              <div
                key={punto.etiqueta}
                className={`admin__barra${esActual ? ' admin__barra--actual' : ''}`}
              >
                <span className="admin__barra-valor">{esActual ? moneda(punto.valor) : ''}</span>
                <div className="admin__barra-pista">
                  <div className="admin__barra-fill" style={{ height: `${alto}%` }} />
                </div>
                <span className="admin__barra-etiqueta">{punto.etiqueta}</span>
              </div>
            )
          })}
        </div>
      </div>

      <footer className="admin__grafico-pie">
        <span>Total de los últimos 7 días</span>
        <strong>
          {moneda(total)}
          <em>COP</em>
        </strong>
      </footer>
    </section>
  )
}

export default GraficoVentas
