import { useRef, useState } from 'react'
import Cabecera from '../ui/Cabecera'
import Kpi from '../ui/Kpi'
import Toast from '../ui/Toast'
import { useAviso } from '../ui/useAviso'
import { IconPlus, IconUser, IconUsuarios } from '../ui/icons'
import { listarUsuarios, resumenUsuarios,
  crearUsuario,
  actualizarUsuario,
  alternarEstadoUsuario,
  eliminarUsuario,
} from '../../services/usuarios'
import { useRemote } from '../../hooks/useRemote'
import RemoteStatus from '../ui/RemoteStatus'
import UsuariosTabla from './UsuariosTabla'
import UsuarioEditor from './UsuarioEditor'
import '../../components/admin/admin.css'
import '../../components/admin/productos.css'

const POR_PAGINA = 8

const FILTROS_INICIALES = { busqueda: '', rol: '', estado: '' }

function AdminUsuarios({ session }) {
  const usuarioActualId = session?.user?.id ?? null

  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState(null)
  const [modo, setModo] = useState('editar')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [claveEditor, setClaveEditor] = useState(0)
  const [aviso, mostrarAviso] = useAviso()

  const remote = useRemote(async options => {
    const [lista, resumen] = await Promise.all([
      listarUsuarios({ ...filtros, pagina, porPagina: POR_PAGINA }, options), resumenUsuarios(options),
    ])
    return { ...lista, totales: resumen.resumen }
  }, [filtros, pagina])
  const usuarios = remote.data?.usuarios ?? []
  const seleccionado = usuarios.find(usuario => usuario.id === seleccionId) ?? null
  const totales = remote.data?.totales
  const hayFiltros = Boolean(filtros.busqueda || filtros.rol || filtros.estado)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  async function accion(operation, mensaje) {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true)
    try { await operation(); mostrarAviso(mensaje) } catch (error) { mostrarAviso(error.message) }
    finally { busyRef.current = false; setBusy(false) }
  }

  function cambiarFiltros(nuevos) {
    setFiltros(nuevos)
    setPagina(1)
  }

  function abrir(usuario, modoPanel) {
    setSeleccionId(usuario.id)
    setModo(modoPanel)
    setPanelAbierto(true)
    setClaveEditor((clave) => clave + 1)
  }

  function crearNuevo() {
    setSeleccionId(null)
    setModo('nuevo')
    setPanelAbierto(true)
    setClaveEditor((clave) => clave + 1)
  }

  async function guardar(cambios) {
    if (modo === 'nuevo') await crearUsuario(cambios)
    else if (seleccionado) await actualizarUsuario(seleccionado.id, cambios)
    else return false
    setPanelAbierto(false)
    mostrarAviso('Usuario guardado correctamente.')
    return true
  }

  function cancelar() {
    if (modo === 'nuevo') {
      setPanelAbierto(false)
      return
    }
    setClaveEditor((clave) => clave + 1)
  }

  function cerrar() {
    setPanelAbierto(false)
  }

  function alternar(usuario) {
    void accion(() => alternarEstadoUsuario(usuario), 'Estado del usuario actualizado.')
  }
  function eliminar(usuario) {
    if (!window.confirm(`¿Eliminar a ${usuario.nombre}? Los usuarios con historial deben desactivarse.`)) return
    void accion(() => eliminarUsuario(usuario.id), 'Usuario eliminado correctamente.')
  }

  return (
    <div className="admin__usuarios">
      <Cabecera
        miga="Usuarios"
        titulo="El equipo detrás del mostrador."
        subtitulo="Administra las cuentas, roles y permisos de tu equipo."
        acciones={
          <button type="button" className="ui__boton ui__boton--primario" onClick={crearNuevo}>
            <IconPlus width="17" height="17" />
            Nuevo usuario
          </button>
        }
      />

      <RemoteStatus {...remote} />
      {remote.data && <>
      <section className="ui__kpis ui__kpis--tres" aria-label="Indicadores de usuarios">
        <Kpi
          oscuro
          etiqueta=""
          valor={
            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              {totales.total} Usuarios totales{' '}
              <span style={{ verticalAlign: 'middle', color: 'var(--white)' }}>
                <IconUsuarios width="20" height="20" />
              </span>
            </span>
          }
        />
        <Kpi
          etiqueta=""
          valor={
            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              {totales.admins} Administradores{' '}
              <span style={{ verticalAlign: 'middle', color: 'var(--terracotta)' }}>
                <IconUser width="20" height="20" />
              </span>
            </span>
          }
        />
        <Kpi
          etiqueta=""
          valor={
            <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
              {totales.cajeros} Cajeros{' '}
              <span style={{ verticalAlign: 'middle', color: 'var(--terracotta)' }}>
                <IconUser width="20" height="20" />
              </span>
            </span>
          }
        />
      </section>

      <div className="admin__productos-cuerpo">
        <UsuariosTabla
          filas={usuarios}
          paginacion={remote.data.paginacion}
          filtros={filtros}
          hayFiltros={hayFiltros}
          onFiltros={cambiarFiltros}
          onPagina={setPagina}
          onEditar={(usuario) => abrir(usuario, 'editar')}
          onAlternar={alternar}
          onEliminar={eliminar}
          usuarioActualId={usuarioActualId}
        />

        {panelAbierto && (
          <UsuarioEditor
            key={`${modo}-${seleccionId ?? 'nuevo'}-${claveEditor}`}
            usuario={seleccionado}
            modo={modo}
            usuarios={usuarios}
            onGuardar={guardar}
            onCancelar={cancelar}
            onCerrar={cerrar}
          />
        )}
      </div>

      </>}
      {busy && <p role="status">Guardando cambios…</p>}
      <Toast mensaje={aviso} icono={<IconUser width="17" height="17" />} />
    </div>
  )
}

export default AdminUsuarios
