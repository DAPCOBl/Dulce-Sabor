import Kpi from '../ui/Kpi'
import { IconInventario, IconWarning } from '../ui/icons'

function InventarioKpis({ productos }) {
  const alertas = productos.filter((producto) => producto.estado !== 'disponible')
  const bajos = alertas.filter((producto) => producto.estado === 'bajo')
  const agotados = alertas.filter((producto) => producto.estado === 'agotado')
  const sinPos = agotados.some((producto) => !producto.enPos)

  return (
    <section className="ui__kpis ui__kpis--tres" aria-label="Resumen de existencias">
      <Kpi
        oscuro
        etiqueta="Productos en alerta"
        valor={alertas.length}
        unidad="productos"
        icono={<IconWarning width="17" height="17" />}
        meta={<span>Stock igual o menor al mínimo</span>}
        nota="Revisa el horno antes del próximo turno."
      />

      <Kpi
        etiqueta="Stock bajo"
        valor={bajos.length}
        unidad="PRODUCTOS"
        icono={<IconInventario width="17" height="17" />}
        extra={
          <div className="ui__pastillas">
            {bajos.map((producto) => (
              <span key={producto.id} className="ui__pastilla ui__pastilla--bajo">
                {producto.nombre}
              </span>
            ))}
          </div>
        }
        nota="Apenas quedan por encima del mínimo."
      />

      <Kpi
        etiqueta="Agotados"
        valor={agotados.length}
        unidad="producto"
        icono={<IconWarning width="17" height="17" />}
        extra={
          <div className="ui__pastillas">
            {agotados.map((producto) => (
              <span key={producto.id} className="ui__pastilla ui__pastilla--agotado">
                {producto.nombre}
              </span>
            ))}
          </div>
        }
        nota={sinPos ? 'No disponible en POS' : 'Retirado del punto de venta'}
      />
    </section>
  )
}

export default InventarioKpis
