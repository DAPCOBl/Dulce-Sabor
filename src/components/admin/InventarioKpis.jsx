import Kpi from '../ui/Kpi'
import { IconInventario, IconWarning } from '../ui/icons'

function InventarioKpis({ productos, resumen }) {
  const alertas = productos.filter((producto) => producto.estado !== 'disponible')
  const bajos = alertas.filter((producto) => producto.estado === 'bajo')
  const agotados = alertas.filter((producto) => producto.estado === 'agotado')

  return (
    <section className="ui__kpis ui__kpis--tres" aria-label="Resumen de existencias">
      <Kpi
        oscuro
        etiqueta="Productos en alerta"
        valor={resumen.enAlerta}
        unidad="productos"
        icono={<IconWarning width="17" height="17" />}
        meta={<span>Stock igual o menor al mínimo</span>}
      />

      <Kpi
        etiqueta="Stock bajo"
        valor={resumen.bajos}
        unidad="PRODUCTOS"
        icono={<IconInventario width="17" height="17" />}
        extra={
          <div className="ui__pastillas">
            {bajos.map((producto) => (
              <span key={producto.id} className="ui__pastilla ui__pastilla--bajo">
                {producto.nombre.toUpperCase()}
              </span>
            ))}
          </div>
        }
      />

      <Kpi
        etiqueta="Agotados"
        valor={resumen.agotados}
        unidad="producto"
        icono={<IconWarning width="17" height="17" />}
        extra={
          <div className="ui__pastillas">
            {agotados.map((producto) => (
              <span key={producto.id} className="ui__pastilla ui__pastilla--agotado">
                {producto.nombre.toUpperCase()}
              </span>
            ))}
          </div>
        }
      />
    </section>
  )
}

export default InventarioKpis
