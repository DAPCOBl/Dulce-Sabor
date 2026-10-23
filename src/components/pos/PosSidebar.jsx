import { IconExit, IconHelp, IconPos, IconSales } from '../ui/icons'

function PosSidebar({
  vista,
  onNavigate,
  session,
  onLogout,
  secciones = null,
  menuTitulo = 'Operación',
  rolEtiqueta = null,
  mostrarSucursal = true,
  admin = false,
}) {
  const nombre = session?.user?.nombre || ''
  const iniciales = nombre
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const rol = rolEtiqueta || session?.user?.rol || ''

  const menuClass = admin ? 'admin__menu' : 'pos__menu'
  const menuTituloClass = admin ? 'admin__menu-titulo' : 'pos__menu-titulo'
  const menuItemClass = admin ? 'admin__menu-item' : 'pos__menu-item'
  const menuItemActivoClass = admin ? 'admin__menu-item--activo' : 'pos__menu-item--activo'

  const seccionesRender = secciones || [
    { id: 'pos', etiqueta: 'Registro de ventas', Icono: IconPos },
    { id: 'turno', etiqueta: 'Ventas del turno', Icono: IconSales },
  ]

  return (
    <aside className={`pos__sidebar${admin ? ' pos__sidebar--admin' : ''}`}>
      <div className="pos__marca">
        <img className="pos__marca-icono" src="/LogoB.svg" alt="Dulce Sabor" />
        <div>
          <p className="pos__marca-nombre">Dulce Sabor</p>
          <p className="pos__marca-tagline">Hecho con cariño</p>
        </div>
      </div>

      {mostrarSucursal && (
        <div className="pos__sucursal">
          <label className="pos__sucursal-label" htmlFor="sucursal">
            Sucursal
          </label>
          <select id="sucursal" className="pos__sucursal-select" defaultValue="principal">
            <option value="principal">Sede principal</option>
          </select>
        </div>
      )}

      <nav className={menuClass} aria-label={menuTitulo}>
        <p className={menuTituloClass}>{menuTitulo}</p>

        {seccionesRender.map(({ id, etiqueta, Icono }) => (
          <button
            key={id}
            type="button"
            className={`${menuItemClass}${vista === id ? ` ${menuItemActivoClass}` : ''}`}
            aria-current={vista === id ? 'page' : undefined}
            onClick={() => onNavigate(id)}
          >
            {Icono && <Icono width="18" height="18" />}
            {etiqueta}
          </button>
        ))}
      </nav>

      <div className="pos__sidebar-pie">
        <div className="pos__ayuda">
          <IconHelp width="18" height="18" />
          <div>
            <p className="pos__ayuda-titulo">¿Necesitas ayuda?</p>
            <p className="pos__ayuda-texto">Consulta la guía de tu sede.</p>
          </div>
        </div>

        <div className="pos__perfil">
          <span className="pos__avatar">{iniciales}</span>
          <div className="pos__perfil-info">
            <p className="pos__perfil-nombre">{nombre}</p>
            {rol && <p className="pos__perfil-rol">{rol}</p>}
          </div>
          <button type="button" className="pos__icon-btn" onClick={onLogout} aria-label="Cerrar sesión">
            <IconExit width="18" height="18" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default PosSidebar
