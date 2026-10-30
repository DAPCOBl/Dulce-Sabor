import { useEffect, useRef, useState } from 'react'
import Modal from '../ui/Modal'
import { IconInfo, IconMail, IconUser } from '../ui/icons'
import { ROLES_USUARIO, ESTADOS_USUARIO } from '../../services/usuarios'

const TITULOS = {
  editar: 'Editar usuario',
  ver: 'Ver usuario',
  nuevo: 'Nuevo usuario',
}

function valoresIniciales(usuario) {
  if (!usuario) {
    return {
      nombre: '',
      email: '',
      rol: 'cajero',
      estado: 'Activo',
      password: '',
      passwordConfirm: '',
    }
  }

  return {
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    estado: usuario.estado,
    password: '',
    passwordConfirm: '',
  }
}

function UsuarioEditor({
  usuario,
  modo,
  usuarios,
  onGuardar,
  onCancelar,
  onCerrar,
}) {
  const [form, setForm] = useState(() => valoresIniciales(usuario))
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const pendingRef = useRef(false)

  const soloLectura = modo === 'ver'

  useEffect(() => {
    if (!guardado) return
    const timer = setTimeout(() => setGuardado(false), 2600)
    return () => clearTimeout(timer)
  }, [guardado])

  function actualizar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
  }

  function validar() {
    const fallos = {}
    const nombre = form.nombre.trim()
    const email = form.email.trim().toLowerCase()

    if (!nombre) fallos.nombre = 'Escribe el nombre del usuario.'
    if (!email) fallos.email = 'Escribe el correo electrónico.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fallos.email = 'El correo no tiene un formato válido.'
    } else if (
      usuarios.some(
        (otro) => otro.email.toLowerCase() === email && otro.id !== usuario?.id,
      )
    ) {
      fallos.email = 'Ya existe un usuario con ese correo.'
    }

    if (!form.rol) fallos.rol = 'Selecciona un rol.'
    if (!form.estado) fallos.estado = 'Selecciona un estado.'

    const esNuevo = modo === 'nuevo'
    const cambioPassword = form.password !== ''

    if (esNuevo && !cambioPassword) {
      fallos.password = 'Escribe una contraseña.'
    }
    if (cambioPassword) {
      if (form.password.length < 8 || new TextEncoder().encode(form.password).length > 72) {
        fallos.password = 'La contraseña debe tener al menos 8 caracteres y como máximo 72 bytes.'
      }
      if (form.password !== form.passwordConfirm) {
        fallos.passwordConfirm = 'Las contraseñas no coinciden.'
      }
    }

    setErrores(fallos)
    return Object.keys(fallos).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (soloLectura || pendingRef.current) return
    if (!validar()) return

    const cambios = {
      nombre: form.nombre.trim(),
      email: form.email.trim().toLowerCase(),
      rol: form.rol,
      estado: form.estado,
    }
    if (form.password) {
      cambios.password = form.password
    }

    pendingRef.current = true; setGuardando(true); setError('')
    try { const ok = await onGuardar(cambios); if (ok) setGuardado(true) }
    catch (error) { setError(error.message) }
    finally { pendingRef.current = false; setGuardando(false) }
  }

  const aviso = guardado
    ? 'Usuario guardado correctamente.'
    : modo === 'nuevo'
      ? 'Completa los datos para crear el usuario.'
      : 'Edita los campos y guarda los cambios.'

  return (
    <Modal
      onCerrar={onCerrar}
      titulo={TITULOS[modo] ?? 'Usuario'}
      subtitulo="Gestiona el acceso al sistema y los permisos del equipo."
      icono={<IconUser width="20" height="20" />}
      tono={guardado ? 'exito' : 'neutro'}
      ancho
      acciones={
        <>
          <button
            type="button"
            className="ui__boton ui__boton--secundario"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          {!soloLectura && (
            <button
              type="submit"
              form="usuario-form"
              disabled={guardando}
              className="ui__boton ui__boton--primario"
            >
              {guardando ? 'Guardando…' : modo === 'nuevo' ? 'Crear usuario' : 'Guardar cambios'}
            </button>
          )}
        </>
      }
    >
      {error && <p className="ui__request-error" role="alert">{error}</p>}
      <form id="usuario-form" className="admin__panel-cuerpo" onSubmit={handleSubmit}>
        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="usuario-nombre">
            Nombre completo
          </label>
          <input
            id="usuario-nombre"
            className={`admin__input${errores.nombre ? ' admin__input--error' : ''}`}
            type="text"
            value={form.nombre}
            onChange={(evento) => actualizar('nombre', evento.target.value)}
            disabled={soloLectura || guardando}
            aria-invalid={Boolean(errores.nombre)}
            placeholder="María García"
          />
          {errores.nombre && <p className="admin__campo-error">{errores.nombre}</p>}
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="usuario-email">
            Correo electrónico
          </label>
          <div className="admin__input-monto">
            <span className="admin__input-prefijo">
              <IconMail width="14" height="14" />
            </span>
            <input
              id="usuario-email"
              className={`admin__input${errores.email ? ' admin__input--error' : ''}`}
              type="email"
              value={form.email}
              onChange={(evento) => actualizar('email', evento.target.value)}
              disabled={soloLectura || guardando}
              aria-invalid={Boolean(errores.email)}
              placeholder="correo@dulcesabor.com"
            />
          </div>
          {errores.email && <p className="admin__campo-error">{errores.email}</p>}
        </div>

        <div className="admin__campo-par">
          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="usuario-rol">
              Rol
            </label>
            <select
              id="usuario-rol"
              className={`admin__input admin__select-editor${errores.rol ? ' admin__input--error' : ''}`}
              value={form.rol}
              onChange={(evento) => actualizar('rol', evento.target.value)}
              disabled={soloLectura || guardando}
            >
              {ROLES_USUARIO.map((rol) => (
                <option key={rol.valor} value={rol.valor}>
                  {rol.etiqueta}
                </option>
              ))}
            </select>
            {errores.rol && <p className="admin__campo-error">{errores.rol}</p>}
          </div>

          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="usuario-estado">
              Estado
            </label>
            <select
              id="usuario-estado"
              className={`admin__input admin__select-editor${errores.estado ? ' admin__input--error' : ''}`}
              value={form.estado}
              onChange={(evento) => actualizar('estado', evento.target.value)}
              disabled={soloLectura || guardando}
            >
              {ESTADOS_USUARIO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {errores.estado && <p className="admin__campo-error">{errores.estado}</p>}
          </div>
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="usuario-password">
            Contraseña {modo !== 'nuevo' && '(dejar vacía para mantener la actual)'}
          </label>
          <input
            id="usuario-password"
            className={`admin__input${errores.password ? ' admin__input--error' : ''}`}
            type="password"
            value={form.password}
            onChange={(evento) => actualizar('password', evento.target.value)}
            disabled={soloLectura || guardando}
            aria-invalid={Boolean(errores.password)}
            placeholder="••••••••"
          />
          {errores.password && <p className="admin__campo-error">{errores.password}</p>}
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="usuario-password-confirm">
            Confirmar contraseña
          </label>
          <input
            id="usuario-password-confirm"
            className={`admin__input${errores.passwordConfirm ? ' admin__input--error' : ''}`}
            type="password"
            value={form.passwordConfirm}
            onChange={(evento) => actualizar('passwordConfirm', evento.target.value)}
            disabled={soloLectura || guardando}
            aria-invalid={Boolean(errores.passwordConfirm)}
            placeholder="••••••••"
          />
          {errores.passwordConfirm && (
            <p className="admin__campo-error">{errores.passwordConfirm}</p>
          )}
        </div>

        <div className="admin__aviso">
          <span className="admin__aviso-icono">
            <IconInfo width="17" height="17" />
          </span>
          <div>
            <p className="admin__aviso-titulo">Permisos</p>
            <p className="admin__aviso-texto">{aviso}</p>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default UsuarioEditor
