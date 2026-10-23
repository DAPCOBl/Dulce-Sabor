import './ui.css'

// Tarjeta de indicador. Todos los módulos la usan con la misma estructura:
// etiqueta, valor, unidad (COP), nota, metadatos y contenido extra.
function Kpi({
  etiqueta,
  valor,
  unidad,
  nota,
  meta,
  extra,
  icono,
  iconoTono,
  oscuro = false,
  destacado = false,
  pieLado = false,
  contenidoCabecera,
}) {
  const clases = ['ui__kpi']
  if (oscuro) clases.push('ui__kpi--oscuro')
  if (destacado) clases.push('ui__kpi--destacado')
  if (pieLado) clases.push('ui__kpi--pie-lado')
  if (contenidoCabecera) clases.push('ui__kpi--cabecera')

  const tienePie = Boolean(meta || extra || nota)

  return (
    <article className={clases.join(' ')}>
      <div className="ui__kpi-top">
        <p className="ui__kpi-etiqueta">{etiqueta}</p>
        {!pieLado && icono && (
          <span className={`ui__kpi-icono${iconoTono ? ` ui__kpi-icono--${iconoTono}` : ''}`}>
            {icono}
          </span>
        )}
        {contenidoCabecera && (
          <div className="ui__kpi-cabecera">{contenidoCabecera}</div>
        )}
      </div>

      {pieLado && tienePie ? (
        <div className="ui__kpi-cuerpo">
          <p className="ui__kpi-valor">
            {valor}
            {unidad && <em>{unidad}</em>}
          </p>
        </div>
      ) : (
        <>
          <p className="ui__kpi-valor">
            {valor}
            {unidad && <em>{unidad}</em>}
          </p>
          {tienePie && (
            <div className="ui__kpi-pie">
              {meta && <div className="ui__kpi-meta">{meta}</div>}
              {extra}
              {nota && <p className="ui__kpi-nota">{nota}</p>}
            </div>
          )}
        </>
      )}

      {pieLado && nota && <p className="ui__kpi-nota">{nota}</p>}
    </article>
  )
}

// Desglose de los cobros por método de pago dentro de una tarjeta KPI.
function KpiDesglosePagos({ efectivo, tarjeta, total }) {
  const pctEfectivo = total > 0 ? (efectivo / total) * 100 : 0
  const pctTarjeta = total > 0 ? (tarjeta / total) * 100 : 0

  return (
    <div className="ui__kpi-desglose">
      <div className="ui__kpi-barra" aria-hidden="true">
        <span className="ui__kpi-barra-efectivo" style={{ width: `${pctEfectivo}%` }} />
        <span className="ui__kpi-barra-tarjeta" style={{ width: `${pctTarjeta}%` }} />
      </div>

      <div className="ui__kpi-leyenda">
        <span className="ui__kpi-leyenda-item">
          <i className="ui__kpi-punto ui__kpi-punto--efectivo" />
          {efectivo} en efectivo
        </span>
        <span className="ui__kpi-leyenda-item">
          <i className="ui__kpi-punto ui__kpi-punto--tarjeta" />
          {tarjeta} con tarjeta
        </span>
      </div>
    </div>
  )
}

export { KpiDesglosePagos }
export default Kpi
