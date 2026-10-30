import { useRef, useState } from 'react'
import Cabecera from '../ui/Cabecera'
import Buscador from '../ui/Buscador'
import Paginacion from '../ui/Paginacion'
import RemoteStatus from '../ui/RemoteStatus'
import { moneda } from '../ui/format'
import { useRemote } from '../../hooks/useRemote'
import { hoyColombia } from '../../utils/fechas'
import { anularGasto, crearGasto, listarGastos } from '../../services/gastos'

const POR_PAGINA = 8

function AdminGastos() {
  const [form, setForm] = useState(() => ({ concepto: '', categoria: 'General', importe: '', fecha: hoyColombia() }))
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('Registrado')
  const [pagina, setPagina] = useState(1)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const pendingRef = useRef(false)
  const remote = useRemote(options => listarGastos({ busqueda, estado, pagina, porPagina: POR_PAGINA }, options), [busqueda, estado, pagina])

  function cambiarCampo(campo, valor) {
    setForm(actual => ({ ...actual, [campo]: valor }))
  }

  async function ejecutar(operation, mensaje) {
    if (pendingRef.current) return false
    pendingRef.current = true
    setGuardando(true)
    setError('')
    setAviso('')
    try {
      await operation()
      setAviso(mensaje)
      return true
    } catch (error) {
      setError(error.message)
      return false
    } finally {
      pendingRef.current = false
      setGuardando(false)
    }
  }

  async function registrar(evento) {
    evento.preventDefault()
    if (pendingRef.current) return
    const importe = Number(form.importe)
    if (!form.concepto.trim() || !form.categoria.trim() || !form.fecha || !Number.isSafeInteger(importe) || importe < 1 || importe > 2147483647) {
      setError('Completa el concepto, la categoría, la fecha y un importe entero positivo en COP.')
      return
    }
    const ok = await ejecutar(() => crearGasto({ concepto: form.concepto.trim(), categoria: form.categoria.trim(), importe, fecha: form.fecha }), 'Gasto registrado correctamente.')
    if (ok) {
      setForm(actual => ({ ...actual, concepto: '', importe: '' }))
      setPagina(1)
    }
  }

  async function anular(gasto) {
    if (pendingRef.current || gasto.estado !== 'Registrado') return
    const motivo = window.prompt(`Motivo para anular el gasto «${gasto.concepto}»:`)
    if (motivo === null) return
    if (!motivo.trim()) {
      setAviso('')
      setError('Escribe el motivo de la anulación.')
      return
    }
    if (motivo.trim().length > 200) {
      setError('El motivo de anulación debe tener como máximo 200 caracteres.')
      return
    }
    await ejecutar(() => anularGasto(gasto.id, motivo.trim()), 'Gasto anulado. El registro y su motivo se conservan en el historial.')
  }

  return (
    <section className="admin__gastos">
      <Cabecera miga="Gastos" titulo="Gastos operativos de tu sede." subtitulo="Registra gastos reales para mantener actualizado el balance del negocio." />
      <section className="admin__tarjeta" aria-labelledby="gastos-registro-titulo">
        <header className="admin__tarjeta-header"><h2 id="gastos-registro-titulo">Registrar gasto</h2></header>
        <form className="admin__panel-cuerpo" onSubmit={registrar} aria-busy={guardando}>
          <fieldset className="ui__fieldset" disabled={guardando}>
            <label className="admin__campo" htmlFor="gasto-concepto">
              <span className="admin__campo-label">Concepto</span>
              <input id="gasto-concepto" className="admin__input" value={form.concepto} onChange={evento => cambiarCampo('concepto', evento.target.value)} maxLength={200} required />
            </label>
            <div className="admin__campo-par">
              <label className="admin__campo" htmlFor="gasto-categoria">
                <span className="admin__campo-label">Categoría</span>
                <input id="gasto-categoria" className="admin__input" value={form.categoria} onChange={evento => cambiarCampo('categoria', evento.target.value)} maxLength={60} required />
              </label>
              <label className="admin__campo" htmlFor="gasto-importe">
                <span className="admin__campo-label">Importe · COP</span>
                <input id="gasto-importe" className="admin__input" type="number" min="1" max="2147483647" step="1" value={form.importe} onChange={evento => cambiarCampo('importe', evento.target.value)} required />
              </label>
            </div>
            <label className="admin__campo" htmlFor="gasto-fecha">
              <span className="admin__campo-label">Fecha del gasto</span>
              <input id="gasto-fecha" className="admin__input" type="date" value={form.fecha} onChange={evento => cambiarCampo('fecha', evento.target.value)} required />
            </label>
            <button type="submit" className="ui__boton ui__boton--primario">{guardando ? 'Guardando…' : 'Registrar gasto'}</button>
          </fieldset>
        </form>
      </section>
      {error && <p className="ui__request-error" role="alert">{error}</p>}
      {aviso && <p className="login__notice" role="status">{aviso}</p>}
      <section className="admin__tarjeta" aria-labelledby="gastos-historial-titulo">
        <header className="admin__tarjeta-header"><h2 id="gastos-historial-titulo">Historial de gastos</h2></header>
        <div className="ui__filtros">
          <Buscador valor={busqueda} onChange={valor => { setBusqueda(valor); setPagina(1) }} etiqueta="Buscar gasto por concepto" placeholder="Buscar gasto por concepto..." />
          <label className="admin__campo" htmlFor="gastos-estado">
            <span className="admin__campo-label">Estado</span>
            <select id="gastos-estado" className="admin__input" value={estado} onChange={evento => { setEstado(evento.target.value); setPagina(1) }}>
              <option value="Registrado">Registrados</option>
              <option value="Anulado">Anulados</option>
              <option value="todos">Todos</option>
            </select>
          </label>
        </div>
        <RemoteStatus {...remote} />
        {remote.data && <>
          <div className="ui__tabla-wrap">
            <table className="ui__tabla">
              <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Importe COP</th><th>Responsable</th><th>Estado</th><th>Acciones</th></tr></thead>
              <tbody>
                {remote.data.gastos.map(gasto => <tr key={gasto.id}>
                  <td>{gasto.fecha}</td><td>{gasto.concepto}</td><td>{gasto.categoria}</td><td>{moneda(gasto.importe)}</td><td>{gasto.responsable}</td>
                  <td>{gasto.estado}{gasto.anulacion && <p className="form__help">{gasto.anulacion.motivo}</p>}</td>
                  <td>{gasto.estado === 'Registrado' && <button type="button" className="ui__enlace" disabled={guardando || remote.loading} onClick={() => anular(gasto)} aria-label={`Anular gasto ${gasto.concepto}`}>Anular</button>}</td>
                </tr>)}
                {!remote.data.gastos.length && <tr><td colSpan={7}>No hay gastos que coincidan con los filtros.</td></tr>}
              </tbody>
            </table>
          </div>
          <Paginacion pagina={remote.data.paginacion.pagina} paginas={remote.data.paginacion.paginas} onPagina={setPagina} texto={`${remote.data.paginacion.total} gastos`} />
        </>}
      </section>
    </section>
  )
}

export default AdminGastos
