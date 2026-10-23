import { IconArrow, IconInventario, IconWarning } from '../ui/icons'

function AlertasInventario({ alertas, onVerInventario }) {
  return (
    <section className="admin__tarjeta admin__alertas">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Atención al horno</h2>
          <p className="admin__tarjeta-sub">Alertas al alcanzar el stock mínimo.</p>
        </div>
        <span className="admin__alertas-contador">
          <IconInventario width="15" height="15" />
          {alertas.length} {alertas.length === 1 ? 'alerta' : 'alertas'}
        </span>
      </header>

      <ul className="admin__alertas-lista">
        {alertas.map((alerta) => {
          const disponible = alerta.stock
          return (
            <li key={alerta.id} className="admin__alerta">
              <span className={`admin__alerta-icono admin__alerta-icono--${alerta.estado}`}>
                <IconWarning width="16" height="16" />
              </span>

              <div className="admin__alerta-info">
                <p className="admin__alerta-nombre">{alerta.nombre}</p>
                <p className="admin__alerta-detalle">
                  {disponible} {disponible === 1 ? 'disponible' : 'disponibles'} · Mínimo{' '}
                  {alerta.minimo} uds.
                </p>
              </div>

              <span className={`admin__badge admin__badge--${alerta.estado}`}>
                {alerta.estado === 'agotado' ? 'Agotado' : 'Bajo'}
              </span>
            </li>
          )
        })}
      </ul>

      <footer className="admin__alertas-pie">
        <button
          type="button"
          className="ui__boton ui__boton--secundario ui__boton--ancho"
          onClick={onVerInventario}
        >
          <IconArrow width="16" height="16" />
          Revisar inventario
        </button>
      </footer>
    </section>
  )
}

export default AlertasInventario
