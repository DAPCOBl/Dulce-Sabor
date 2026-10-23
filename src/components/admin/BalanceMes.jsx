import { IconArrow } from '../ui/icons'
import { moneda } from '../ui/format'

function BalanceMes({ balance, onVerReporte }) {
  const utilidad = balance.ingresos - balance.costoProductosVendidos - balance.gastosOperativos

  return (
    <section className="admin__tarjeta admin__balance">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Balance del mes</h2>
        </div>
      </header>

      <ul className="admin__balance-lista">
        <li className="admin__balance-fila">
          <span className="admin__balance-concepto">Ingresos por ventas</span>
          <strong className="admin__balance-valor">{moneda(balance.ingresos)}</strong>
        </li>
        <li className="admin__balance-fila admin__balance-fila--resta">
          <span className="admin__balance-concepto">− Costo de productos vendidos</span>
          <strong className="admin__balance-valor">
            {moneda(balance.costoProductosVendidos)}
          </strong>
        </li>
        <li className="admin__balance-fila admin__balance-fila--resta">
          <span className="admin__balance-concepto">− Gastos operativos</span>
          <strong className="admin__balance-valor">{moneda(balance.gastosOperativos)}</strong>
        </li>
      </ul>

      <div className="admin__balance-utilidad">
        <span className="admin__balance-utilidad-etiqueta">Utilidad estimada</span>
        <strong className="admin__balance-utilidad-valor">{moneda(utilidad)}</strong>
      </div>

      <button type="button" className="ui__enlace admin__balance-enlace" onClick={onVerReporte}>
        Ver reporte financiero
        <IconArrow width="15" height="15" />
      </button>
    </section>
  )
}

export default BalanceMes
