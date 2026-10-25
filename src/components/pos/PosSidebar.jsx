import { IconArrow, IconExit, IconHelp, IconPos, IconSales } from '../ui/icons'

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
  link = null,
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
  const iconBtnClass = admin ? 'admin__icon-btn' : 'pos__icon-btn'

  const sidebarPieClass = admin ? 'admin__sidebar-pie' : 'pos__sidebar-pie'
  const ayudaClass = admin ? 'admin__ayuda' : 'pos__ayuda'
  const ayudaTituloClass = admin ? 'admin__ayuda-titulo' : 'pos__ayuda-titulo'
  const ayudaTextoClass = admin ? 'admin__ayuda-texto' : 'pos__ayuda-texto'
  const ayudaEnlaceClass = admin ? 'admin__ayuda-enlace' : 'pos__ayuda-enlace'
  const perfilClass = admin ? 'admin__perfil' : 'pos__perfil'
  const avatarClass = admin ? 'admin__avatar' : 'pos__avatar'
  const perfilInfoClass = admin ? 'admin__perfil-info' : 'pos__perfil-info'
  const perfilNombreClass = admin ? 'admin__perfil-nombre' : 'pos__perfil-nombre'
  const perfilRolClass = admin ? 'admin__perfil-rol' : 'pos__perfil-rol'

  const esAdmin = admin || String(rol).toLowerCase().includes('admin')
  const guiaEnlace = link || (esAdmin ? '/guia/administrador' : '/guia/cajero')

  const seccionesRender = secciones || [
    { id: 'pos', etiqueta: 'Registro de ventas', Icono: IconPos },
    { id: 'ventas', etiqueta: 'Ventas del día', Icono: IconSales },
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

      <div className={sidebarPieClass}>
        <div className={ayudaClass}>
          <IconHelp width="18" height="18" />
          <div>
            <p className={ayudaTituloClass}>¿Necesitas ayuda?</p>
            <p className={ayudaTextoClass}>Consulta la guía de tu sede.</p>
            <a className={ayudaEnlaceClass} href={guiaEnlace}>
              Abrir guía
              <IconArrow width="13" height="13" />
            </a>
          </div>
        </div>

        <div className={perfilClass}>
          <span className={avatarClass}>{iniciales}</span>
          <div className={perfilInfoClass}>
            <p className={perfilNombreClass}>{nombre}</p>
            {rol && <p className={perfilRolClass}>{rol}</p>}
          </div>
          <button type="button" className={iconBtnClass} onClick={onLogout} aria-label="Cerrar sesión">
            <IconExit width="18" height="18" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default PosSidebar
