import { IconArrow } from '../ui/icons'
import { moneda } from '../ui/format'
import { METODOS_PAGO } from '../ui/metodos'

function UltimasVentas({ ventas, onVerVentas }) {
  return (
    <section className="admin__tarjeta admin__ultimas">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Últimas ventas</h2>
        </div>

        <button type="button" className="ui__enlace" onClick={onVerVentas}>
          Ver todas
          <IconArrow width="15" height="15" />
        </button>
      </header>

      <div className="ui__tabla-wrap">
        <table className="ui__tabla">
          <thead>
            <tr>
              <th>Venta</th>
              <th>Hora</th>
              <th>Pago</th>
              <th>Estado</th>
              <th className="admin__col-total">Total COP</th>
              <th>Cajero</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => {
              const metodo = METODOS_PAGO[venta.metodo]
              const IconoMetodo = metodo.Icono
              return (
                <tr key={venta.id}>
                  <td className="admin__folio">{venta.folio}</td>
                  <td className="admin__hora">{venta.hora}</td>
                  <td>
                    <span className={`admin__pago admin__pago--${venta.metodo}`}>
                      <IconoMetodo width="14" height="14" />
                      {metodo.etiqueta}
                    </span>
                  </td>
                  <td>
                    <span className="admin__estado">
                      <span className="admin__estado-punto" />
                      {venta.estado}
                    </span>
                  </td>
                  <td className="admin__col-total admin__total">{moneda(venta.importe)}</td>
                  <td className="admin__cajero">{venta.cajero}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default UltimasVentas
