import { useMemo, useState } from 'react'
import Cabecera from '../ui/Cabecera'
import Kpi from '../ui/Kpi'
import Toast from '../ui/Toast'
import { useAviso } from '../ui/useAviso'
import { IconPlus, IconUser, IconUsuarios } from '../ui/icons'
import { useUsuarios,
  crearUsuario,
  actualizarUsuario,
  alternarEstadoUsuario,
  eliminarUsuario,
} from '../../services/usuarios'
import UsuariosTabla from './UsuariosTabla'
import UsuarioEditor from './UsuarioEditor'
import '../../components/admin/admin.css'
import '../../components/admin/productos.css'

const POR_PAGINA = 8

const FILTROS_INICIALES = { busqueda: '', rol: '', estado: '' }

function AdminUsuarios({ session }) {
  const usuarios = useUsuarios()
  const usuarioActualId = session?.user?.id ?? null

  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [seleccionId, setSeleccionId] = useState(null)
  const [modo, setModo] = useState('editar')
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [claveEditor, setClaveEditor] = useState(0)
  const [aviso, mostrarAviso] = useAviso()

  const seleccionado = usuarios.find((usuario) => usuario.id === seleccionId) ?? null

  const filtrados = useMemo(() => {
    const busqueda = filtros.busqueda.trim().toLowerCase()

    return usuarios.filter((usuario) => {
      if (busqueda) {
        const coincide =
          usuario.nombre.toLowerCase().includes(busqueda) ||
          usuario.email.toLowerCase().includes(busqueda)
        if (!coincide) return false
      }
      if (filtros.rol && usuario.rol !== filtros.rol) return false
      if (filtros.estado && usuario.estado !== filtros.estado) return false
      return true
    })
  }, [usuarios, filtros])

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, paginas)
  const desde = filtrados.length === 0 ? 0 : (paginaActual - 1) * POR_PAGINA + 1
  const hasta = Math.min(paginaActual * POR_PAGINA, filtrados.length)
  const filas = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)

  const hayFiltros = Boolean(filtros.busqueda || filtros.rol || filtros.estado)

  const totales = useMemo(() => {
    return {
      total: usuarios.length,
      admins: usuarios.filter((usuario) => usuario.rol === 'administrador').length,
      cajeros: usuarios.filter((usuario) => usuario.rol === 'cajero').length,
      activos: usuarios.filter((usuario) => usuario.estado === 'Activo').length,
    }
  }, [usuarios])

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

  function guardar(cambios) {
    if (modo === 'nuevo') {
      crearUsuario(cambios)
      setPagina(1)
      setPanelAbierto(false)
      mostrarAviso('Usuario creado correctamente.')
      return true
    }

    if (!seleccionado) return false
    actualizarUsuario(seleccionado.id, cambios)
    mostrarAviso('Usuario actualizado correctamente.')
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
    const ok = alternarEstadoUsuario(usuario.id)
    if (!ok) {
      mostrarAviso('No se puede desactivar el último administrador activo.')
      return
    }
    mostrarAviso(
      usuario.estado === 'Activo'
        ? 'Usuario desactivado correctamente.'
        : 'Usuario activado correctamente.',
    )
  }

  function eliminar(usuario) {
    const confirmado = window.confirm(
      `¿Eliminar a ${usuario.nombre}? Esta acción no se puede deshacer.`,
    )
    if (!confirmado) return

    const ok = eliminarUsuario(usuario.id, usuarioActualId)
    if (!ok) {
      mostrarAviso('No se pudo eliminar el usuario.')
      return
    }
    mostrarAviso('Usuario eliminado correctamente.')
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
          filas={filas}
          paginacion={{ pagina: paginaActual, paginas, total: filtrados.length, desde, hasta }}
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

      <Toast mensaje={aviso} icono={<IconUser width="17" height="17" />} />
    </div>
  )
}

export default AdminUsuarios
