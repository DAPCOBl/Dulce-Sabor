import { IconHistorial, IconInfo } from '../ui/icons'
import { TIPOS_MOVIMIENTO } from '../../data/inventario'

function MovimientosRecientes({ movimientos }) {
  return (
    <section className="admin__tarjeta">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Movimientos recientes</h2>
          <p className="admin__tarjeta-sub">Trazabilidad de entradas, ajustes y salidas</p>
        </div>
        <span className="admin__borrador admin__borrador--neutro">
          <IconHistorial width="15" height="15" />
          {movimientos.length} del día
        </span>
      </header>

      <div className="ui__tabla-wrap">
        <table className="ui__tabla ui__tabla--movimientos">
          <thead>
            <tr>
              <th>Hora / Referencia</th>
              <th className="admin__col-tipo">Tipo</th>
              <th>Producto</th>
              <th>Cambio</th>
              <th>Saldo</th>
              <th>Responsable</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((movimiento) => (
              <tr key={movimiento.id}>
                <td>
                  <p className="admin__folio">{movimiento.hora}</p>
                  <p className="admin__referencia">{movimiento.referencia}</p>
                </td>
                <td className="admin__col-tipo">
                  <span
                    className={`admin__mov-tipo admin__mov-tipo--${TIPOS_MOVIMIENTO[movimiento.tipo]?.clase ?? 'entrada'}`}
                  >
                    {TIPOS_MOVIMIENTO[movimiento.tipo]?.etiqueta ?? movimiento.tipo}
                  </span>
                </td>
                <td>
                  <div className="admin__producto">
                    <span className="admin__producto-nombre">{movimiento.producto}</span>
                    <span className="admin__producto-sku">{movimiento.sku}</span>
                  </div>
                </td>
                <td>
                  <span
                    className={`admin__cambio-mov admin__cambio-mov--${movimiento.cambio >= 0 ? 'sube' : 'baja'}`}
                  >
                    {movimiento.cambio >= 0 ? '+' : ''}
                    {movimiento.cambio}
                  </span>
                </td>
                <td>
                  <span className="admin__stock">{movimiento.saldo}</span>
                </td>
                <td>
                  <div className="admin__producto">
                    <span className="admin__mov-responsable">{movimiento.responsable}</span>
                    <span className="admin__producto-sku">{movimiento.motivo}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="admin__pie-notas">
        <p>
          <IconInfo width="15" height="15" />
          Los movimientos no se editan: para corregir un registro comunicarse con el administrador.
        </p>
      </footer>
    </section>
  )
}

export default MovimientosRecientes
