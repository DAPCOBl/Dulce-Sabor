import { useRef, useState } from 'react'
import Cabecera from '../ui/Cabecera'
import Kpi from '../ui/Kpi'
import { moneda } from '../ui/format'
import { IconExport, IconSales, IconTendenciaUp } from '../ui/icons'
import { METODOS_PAGO } from '../ui/metodos'
import { useRemote } from '../../hooks/useRemote'
import { hoyColombia, desplazarDia } from '../../utils/fechas'
import { reporteVentas, exportarReporte as solicitarExportacion, descargarArchivo } from '../../services/reportes'
import { opcionesVentas } from '../../services/ventas'
import RemoteStatus from '../ui/RemoteStatus'
import GraficoVentas from './GraficoVentas'
import BalanceMes from './BalanceMes'
import './admin.css'
import './adminVentas.css'

function AdminReportes() {
  const [desde, setDesde] = useState(() => desplazarDia(hoyColombia(), -6))
  const [hasta, setHasta] = useState(hoyColombia)
  const [cajero, setCajero] = useState('todos')
  const [metodo, setMetodo] = useState('todos')
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState('')
  const exportRef = useRef(false)
  const filtros = { desde, hasta, cajeroId: cajero, metodo }
  const remote = useRemote(options => reporteVentas(filtros, options), [filtros])
  const opciones = useRemote(opcionesVentas)
  const fechaInicio = desde
  const fechaFin = hasta
  const balance = remote.data?.balance
  const ingresosTotales = remote.data?.resumen.ingresos
  const ventasTotales = remote.data?.resumen.ventas
  const utilidad = balance?.utilidad ?? balance?.utilidadBruta
  const margen = balance?.margen ?? balance?.margenBruto
  const serie = remote.data?.serie ?? []
  const totalRango = ingresosTotales
  const porMetodo = remote.data?.porMetodo ?? []
  const porCajero = remote.data?.porCajero ?? []
  const topProductos = remote.data?.topProductos ?? []
  const nombreCajero = opciones.data?.cajeros.find(u => u.id === cajero)?.nombre ?? cajero
  const formatearFecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  const rangoTitulo = desde && hasta ? `${formatearFecha(desde)} – ${formatearFecha(hasta)}` : 'Selecciona un rango'
  const rangoTexto = rangoTitulo
  async function exportarReporte() {
    if (exportRef.current || !remote.data || remote.loading || remote.error) return
    exportRef.current = true; setExportando(true); setError('')
    try { descargarArchivo(await solicitarExportacion(filtros)) } catch (error) { setError(error.message) }
    finally { exportRef.current = false; setExportando(false) }
  }
  function aplicarPreset(dias) {
    const hoy = hoyColombia()
    setDesde(desplazarDia(hoy, -(dias - 1)))
    setHasta(hoy)
  }
  return (
    <section className="admin__reportes">
      <Cabecera
        miga="Reportes"
        titulo="Reporte completo del negocio."
        subtitulo="Filtra por rango de fechas y revisa ingresos, ventas, balance y detalle por método, cajero y producto."
        acciones={
          <button type="button" className="ui__boton ui__boton--primario" onClick={exportarReporte} disabled={exportando || remote.loading || !remote.data || Boolean(remote.error)}>
            <IconExport width="17" height="17" />
            {exportando ? 'Exportando…' : 'Exportar reporte'}
          </button>
        }
      />

      <section className="admin__filtros" aria-label="Filtros del reporte">
        <div className="admin__filtro-grupo">
          <label className="admin__filtro-etiqueta" htmlFor="reporte-desde">Desde</label>
          <input
            id="reporte-desde"
            type="date"
            className="admin__sucursal-select admin__filtro-select"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
        <div className="admin__filtro-grupo">
          <label className="admin__filtro-etiqueta" htmlFor="reporte-hasta">Hasta</label>
          <input
            id="reporte-hasta"
            type="date"
            className="admin__sucursal-select admin__filtro-select"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
          />
        </div>
        <div className="admin__filtro-grupo">
          <label className="admin__filtro-etiqueta" aria-hidden="true">&nbsp;</label>
          <select
            className="admin__sucursal-select admin__filtro-select"
            value={cajero}
            onChange={(e) => setCajero(e.target.value)}
            aria-label="Cajero"
          >
          <option value="todos">Todos los cajeros</option>
          {opciones.data?.cajeros.map(usuario => (
            <option key={usuario.id} value={usuario.id}>{usuario.nombre}</option>
          ))}
        </select>
        </div>
        <div className="admin__filtro-grupo">
          <label className="admin__filtro-etiqueta" aria-hidden="true">&nbsp;</label>
          <select
            className="admin__sucursal-select admin__filtro-select"
            value={metodo}
            onChange={(e) => setMetodo(e.target.value)}
            aria-label="Método de pago"
          >
          <option value="todos">Todos los métodos</option>
          {Object.entries(METODOS_PAGO).map(([valor, info]) => (
            <option key={valor} value={valor}>{info.etiqueta}</option>
          ))}
        </select>
        </div>
        <div className="admin__filtros-presets">
          <button type="button" className="ui__boton ui__boton--secundario ui__boton--sm" onClick={() => aplicarPreset(1)}>Hoy</button>
          <button type="button" className="ui__boton ui__boton--secundario ui__boton--sm" onClick={() => aplicarPreset(7)}>7 días</button>
          <button type="button" className="ui__boton ui__boton--secundario ui__boton--sm" onClick={() => aplicarPreset(15)}>15 días</button>
          <button type="button" className="ui__boton ui__boton--secundario ui__boton--sm" onClick={() => aplicarPreset(30)}>30 días</button>
        </div>
      </section>

      <RemoteStatus {...opciones} />
      <RemoteStatus {...remote} />
      {error && <p className="ui__request-error" role="alert">{error}</p>}
      {remote.data && <>
      <h3 className="admin__reportes-titulo">Reporte del {rangoTitulo}</h3>

      <section className="ui__kpis" aria-label="Indicadores del reporte">
        <Kpi
          oscuro
          etiqueta="Ingresos del rango"
          valor={moneda(ingresosTotales)}
          unidad="COP"
          icono={<IconSales width="17" height="17" />}
          nota={`${ventasTotales} ${ventasTotales === 1 ? 'venta' : 'ventas'}`}
        />
        <Kpi
          etiqueta="Ventas"
          valor={ventasTotales}
          nota="Todos los cajeros"
        />
        <Kpi
          destacado
          etiqueta={balance.gastosAsignados ? "Utilidad neta" : "Utilidad bruta"}
          valor={moneda(utilidad)}
          unidad="COP"
          icono={<IconTendenciaUp width="17" height="17" />}
          nota={`Margen ${margen.toFixed(1)}%`}
        />
      </section>

      {serie.length > 1 && (
        <section className="admin__reportes-grafico" aria-label="Ventas del rango">
          <GraficoVentas serie={serie} total={totalRango} rango={rangoTexto} />
        </section>
      )}

      <div className="admin__reportes-grid">
        <BalanceMes
          balance={balance}
          titulo={`Balance · ${formatearFecha(fechaInicio)} – ${formatearFecha(fechaFin)}${cajero !== 'todos' ? ` · ${nombreCajero}` : ''}${metodo !== 'todos' ? ` · ${METODOS_PAGO[metodo].etiqueta}` : ''}`}
        />

      <section className="admin__tarjeta" aria-label="Detalle por método de pago">
        <header className="admin__tarjeta-header">
          <div>
            <h2 className="admin__tarjeta-titulo">Por método de pago</h2>
            <p className="admin__tarjeta-sub">Ingresos y cantidad de ventas por forma de cobro</p>
          </div>
        </header>
        <div className="ui__tabla-wrap">
          <table className="ui__tabla">
            <thead>
              <tr>
                <th>Método</th>
                <th>Ventas</th>
                <th>Ingresos</th>
                <th>Participación</th>
              </tr>
            </thead>
            <tbody>
              {porMetodo.map((item) => (
                <tr key={item.valor}>
                  <td>{item.etiqueta}</td>
                  <td>{item.ventas}</td>
                  <td className="admin__total">{moneda(item.ingresos)}</td>
                  <td>
                    {ingresosTotales > 0 ? `${((item.ingresos / ingresosTotales) * 100).toFixed(1)}%` : '0%'}
                  </td>
                </tr>
              ))}
              {porMetodo.length === 0 && (
                <tr>
                  <td colSpan="4">Sin ventas en el rango seleccionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin__tarjeta" aria-label="Detalle por cajero">
        <header className="admin__tarjeta-header">
          <div>
            <h2 className="admin__tarjeta-titulo">Por cajero</h2>
            <p className="admin__tarjeta-sub">Rendimiento de cada cajero en el rango</p>
          </div>
        </header>
        <div className="ui__tabla-wrap">
          <table className="ui__tabla">
            <thead>
              <tr>
                <th>Cajero</th>
                <th>Ventas</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {porCajero.map((item) => (
                <tr key={item.nombre}>
                  <td>{item.nombre}</td>
                  <td>{item.ventas}</td>
                  <td className="admin__total">{moneda(item.ingresos)}</td>
                </tr>
              ))}
              {porCajero.length === 0 && (
                <tr>
                  <td colSpan="3">Sin ventas en el rango seleccionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </div>

      <section className="admin__tarjeta" aria-label="Productos más vendidos">
        <header className="admin__tarjeta-header">
          <div>
            <h2 className="admin__tarjeta-titulo">Productos más vendidos</h2>
            <p className="admin__tarjeta-sub">Top de productos por ingresos en el rango</p>
          </div>
        </header>
        <div className="ui__tabla-wrap">
          <table className="ui__tabla">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProductos.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.cantidad}</td>
                  <td className="admin__total">{moneda(item.ingresos)}</td>
                </tr>
              ))}
              {topProductos.length === 0 && (
                <tr>
                  <td colSpan="3">Sin ventas en el rango seleccionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      </>}
    </section>
  )
}

export default AdminReportes

