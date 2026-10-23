import { IconArrow, IconExit, IconHelp } from '../ui/icons'
import { SECCIONES } from './secciones'

function AdminSidebar({ vista, onNavigate, session, onLogout }) {
  const nombre = session.user.nombre
  const iniciales = nombre
    .split(' ')
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="admin__sidebar">
      <div className="admin__marca">
        <img className="admin__marca-icono" src="/LogoB.svg" alt="Dulce Sabor" />
        <div>
          <p className="admin__marca-nombre">Dulce Sabor</p>
          <p className="admin__marca-tagline">Hecho con cariño</p>
        </div>
      </div>

      <div className="admin__sucursal">
        <label className="admin__sucursal-label" htmlFor="admin-sucursal">
          Sucursal
        </label>
        <select id="admin-sucursal" className="admin__sucursal-select" defaultValue="principal">
          <option value="principal">Sede principal</option>
        </select>
      </div>

      <nav className="admin__menu" aria-label="Administración">
        <p className="admin__menu-titulo">Administración</p>

        {SECCIONES.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            className={`admin__menu-item${vista === id ? ' admin__menu-item--activo' : ''}`}
            aria-current={vista === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            <Icono width="18" height="18" />
            {etiqueta}
          </button>
        ))}
      </nav>

      <div className="admin__sidebar-pie">
        <div className="admin__ayuda">
          <IconHelp width="18" height="18" />
          <div>
            <p className="admin__ayuda-titulo">¿Necesitas ayuda?</p>
            <p className="admin__ayuda-texto">Consulta la guía de tu sede.</p>
            <button type="button" className="admin__ayuda-enlace">
              Abrir guía
              <IconArrow width="13" height="13" />
            </button>
          </div>
        </div>

        <div className="admin__perfil">
          <span className="admin__avatar">{iniciales}</span>
          <div className="admin__perfil-info">
            <p className="admin__perfil-nombre">{nombre}</p>
            <p className="admin__perfil-rol">Administrador</p>
          </div>
          <button type="button" className="admin__icon-btn" onClick={onLogout} aria-label="Cerrar sesión">
            <IconExit width="18" height="18" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
