import Buscador from '../ui/Buscador'
import Paginacion from '../ui/Paginacion'
import Vacio from '../ui/Vacio'
import { Select } from '../ui/Filtro'
import { IconClose, IconDesactivar, IconEditar, IconTrash } from '../ui/icons'

const OPCIONES_ROL = [
  { valor: '', etiqueta: 'Rol: todos' },
  { valor: 'administrador', etiqueta: 'Rol: administradores' },
  { valor: 'cajero', etiqueta: 'Rol: cajeros' },
]

const OPCIONES_ESTADO = [
  { valor: '', etiqueta: 'Estado: todos' },
  { valor: 'Activo', etiqueta: 'Estado: activos' },
  { valor: 'Inactivo', etiqueta: 'Estado: inactivos' },
]

function iniciales(nombre = '') {
  return nombre
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function UsuariosTabla({
  filas,
  paginacion,
  filtros,
  hayFiltros,
  onFiltros,
  onPagina,
  onEditar,
  onAlternar,
  onEliminar,
  usuarioActualId,
}) {
  const { pagina, paginas, total, desde, hasta } = paginacion

  function actualizarFiltro(campo, valor) {
    onFiltros({ ...filtros, [campo]: valor })
  }

  return (
    <section className="admin__tarjeta admin__catalogo">
      <header className="admin__tarjeta-header">
        <div>
          <h2 className="admin__tarjeta-titulo">Usuarios</h2>
          <p className="admin__tarjeta-sub">
            Cuentas, roles y permisos del equipo · {total} usuarios
          </p>
        </div>
      </header>

      <div className="ui__filtros">
        <Buscador
          valor={filtros.busqueda}
          onChange={(valor) => actualizarFiltro('busqueda', valor)}
          placeholder="Buscar por nombre o correo..."
          etiqueta="Buscar usuario por nombre o correo"
        />

        <Select
          valor={filtros.rol}
          onChange={(valor) => actualizarFiltro('rol', valor)}
          opciones={OPCIONES_ROL}
          ariaLabel="Filtrar por rol"
        />

        <Select
          valor={filtros.estado}
          onChange={(valor) => actualizarFiltro('estado', valor)}
          opciones={OPCIONES_ESTADO}
          ariaLabel="Filtrar por estado"
        />

        <button
          type="button"
          className="ui__enlace admin__limpiar"
          onClick={() => onFiltros({ busqueda: '', rol: '', estado: '' })}
          disabled={!hayFiltros}
        >
          <IconClose width="14" height="14" />
          Limpiar filtros
        </button>
      </div>
      {filas.length > 0 ? (
        <div className="ui__tabla-wrap">
          <table className="ui__tabla ui__tabla--productos">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Estado</th>
                <th scope="col">Último acceso</th>
                <th scope="col" className="admin__col-acciones">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filas.map((usuario) => {
                const inactivo = usuario.estado !== 'Activo'
                const esActual = usuario.id === usuarioActualId

                return (
                  <tr key={usuario.id}>
                    <td className="admin__col-producto">
                      <div className="admin__producto">
                        <span
                          className="admin__avatar"
                          style={{ width: 32, height: 32, fontSize: 12, display: 'inline-grid', placeItems: 'center' }}
                        >
                          {iniciales(usuario.nombre)}
                        </span>
                        <span className="admin__producto-nombre">{usuario.nombre}</span>
                      </div>
                    </td>
                    <td className="admin__celda-suave">{usuario.email}</td>
                    <td>
                      <span className="admin__pago admin__pago--tarjeta">
                        {usuario.rol === 'administrador' ? 'Administrador' : 'Cajero'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin__estado${inactivo ? ' admin__estado--inactivo' : ''}`}
                      >
                        <span className="admin__estado-punto" />
                        {usuario.estado}
                      </span>
                    </td>
                    <td className="admin__celda-suave">{usuario.ultimoAcceso}</td>
                    <td className="admin__col-acciones">
                      {esActual ? (
                        <span className="admin__estado">Tú</span>
                      ) : (
                        <div className="admin__acciones-fila">
                          <button
                            type="button"
                            className="admin__accion"
                            onClick={() => onEditar(usuario)}
                            aria-label={`Editar ${usuario.nombre}`}
                            title="Editar"
                          >
                            <IconEditar width="17" height="17" />
                          </button>
                          <button
                            type="button"
                            className={`admin__accion${inactivo ? ' admin__accion--activar' : ' admin__accion--desactivar'}`}
                            onClick={() => onAlternar(usuario)}
                            aria-label={
                              inactivo
                                ? `Activar ${usuario.nombre}`
                                : `Desactivar ${usuario.nombre}`
                            }
                            title={inactivo ? 'Activar' : 'Desactivar'}
                          >
                            <IconDesactivar width="17" height="17" />
                          </button>
                          <button
                            type="button"
                            className="admin__accion admin__accion--desactivar"
                            onClick={() => onEliminar(usuario)}
                            aria-label={`Eliminar ${usuario.nombre}`}
                            title="Eliminar"
                          >
                            <IconTrash width="17" height="17" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Vacio
          titulo="Sin resultados"
          detalle="Ningún usuario coincide con los filtros aplicados. Prueba con otro nombre o limpia los filtros."
        />
      )}

      <footer className="admin__paginacion">
        <Paginacion
          pagina={pagina}
          paginas={paginas}
          onPagina={onPagina}
          texto={`Mostrando ${desde}-${hasta} de ${total} usuarios`}
        />
      </footer>
    </section>
  )
}

export default UsuariosTabla

