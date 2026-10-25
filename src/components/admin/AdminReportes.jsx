import { useMemo, useState } from 'react'
import Cabecera from '../../components/ui/Cabecera'
import Kpi from '../../components/ui/Kpi'
import { moneda, diaCorto, isoFecha } from '../../components/ui/format'
import { IconExport, IconSales, IconTendenciaUp } from '../../components/ui/icons'
import { METODOS_PAGO } from '../../components/ui/metodos'
import { BALANCE_MES } from '../../data/admin'
import { subtotalDe } from '../../data/precios'
import {
  CAJEROS_SEDE,
  VENTAS_SEDE,
  fechaDeVenta,
} from '../../data/ventasSede'
import { useEstado } from '../../services/estado'
import GraficoVentas from './GraficoVentas'
import BalanceMes from './BalanceMes'
import '../../components/admin/admin.css'
import '../../components/admin/adminVentas.css'

function AdminReportes() {
  const { sesion } = useEstado()
  const [hoy] = useState(() => new Date())

  const [desde, setDesde] = useState(() => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() - 6)
    return isoFecha(fecha)
  })
  const [hasta, setHasta] = useState(() => isoFecha(new Date()))
  const [cajero, setCajero] = useState('todos')
  const [metodo, setMetodo] = useState('todos')

  const rangoValido = desde <= hasta
  const fechaInicio = rangoValido ? desde : hasta
  const fechaFin = rangoValido ? hasta : desde

  const ventasRango = useMemo(() => {
    const inicio = new Date(`${fechaInicio}T00:00:00`)
    const fin = new Date(`${fechaFin}T23:59:59`)
    return VENTAS_SEDE.filter((venta) => {
      const fechaVenta = fechaDeVenta(venta, hoy)
      if (fechaVenta < inicio || fechaVenta > fin) return false
      if (cajero !== 'todos' && venta.cajero !== cajero) return false
      if (metodo !== 'todos' && venta.metodo !== metodo) return false
      return true
    })
  }, [fechaInicio, fechaFin, cajero, metodo, hoy])

  const ingresosRango = useMemo(
    () => ventasRango.reduce((acumulado, venta) => acumulado + venta.importe, 0),
    [ventasRango],
  )

  const incluyeHoy = useMemo(() => {
    const hoyIso = isoFecha(hoy)
    return fechaInicio <= hoyIso && fechaFin >= hoyIso
  }, [fechaInicio, fechaFin, hoy])

  const ingresosTotales = ingresosRango + (incluyeHoy ? sesion.ingresos : 0)
  const ventasTotales = ventasRango.length + (incluyeHoy ? sesion.ventas : 0)

  const costoRatio = BALANCE_MES.costoProductosVendidos / BALANCE_MES.ingresos
  const gastosRatio = BALANCE_MES.gastosOperativos / BALANCE_MES.ingresos
  const balance = {
    ingresos: ingresosTotales,
    costoProductosVendidos: Math.round(ingresosTotales * costoRatio),
    gastosOperativos: Math.round(ingresosTotales * gastosRatio),
  }
  const utilidad = balance.ingresos - balance.costoProductosVendidos - balance.gastosOperativos
  const margen = balance.ingresos > 0 ? (utilidad / balance.ingresos) * 100 : 0

  const diasRango = useMemo(() => {
    const inicio = new Date(`${fechaInicio}T00:00:00`)
    const fin = new Date(`${fechaFin}T00:00:00`)
    const lista = []
    const cursor = new Date(inicio)
    while (cursor <= fin) {
      lista.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return lista
  }, [fechaInicio, fechaFin])

  const serie = useMemo(
    () =>
      diasRango.map((dia) => {
        const iso = isoFecha(dia)
        const total = ventasRango
          .filter((venta) => isoFecha(fechaDeVenta(venta, hoy)) === iso)
          .reduce((acumulado, venta) => acumulado + venta.importe, 0)
        const esHoy = iso === isoFecha(hoy)
        const valor = total + (esHoy && incluyeHoy ? sesion.ingresos : 0)
        return { valor, etiqueta: diaCorto(dia) }
      }),
    [diasRango, ventasRango, hoy, incluyeHoy, sesion.ingresos],
  )

  const totalRango = useMemo(
    () => serie.reduce((acumulado, punto) => acumulado + punto.valor, 0),
    [serie],
  )

  const porMetodo = useMemo(
    () =>
      Object.entries(METODOS_PAGO)
        .map(([valor, info]) => {
          const ventas = ventasRango.filter((venta) => venta.metodo === valor)
          return {
            valor,
            etiqueta: info.etiqueta,
            ventas: ventas.length,
            ingresos: ventas.reduce((acumulado, venta) => acumulado + venta.importe, 0),
          }
        })
        .filter((item) => item.ventas > 0),
    [ventasRango],
  )

  const porCajero = useMemo(
    () =>
      CAJEROS_SEDE.map((nombre) => {
        const ventas = ventasRango.filter((venta) => venta.cajero === nombre)
        const ingresos = ventas.reduce((acumulado, venta) => acumulado + venta.importe, 0)
        return {
          nombre,
          ventas: ventas.length,
          ingresos,
        }
      }).filter((item) => item.ventas > 0),
    [ventasRango],
  )

  const topProductos = useMemo(() => {
    const acumulado = {}
    ventasRango.forEach((venta) => {
      venta.items.forEach((item) => {
        if (!acumulado[item.id]) {
          acumulado[item.id] = {
            id: item.id,
            nombre: item.nombre,
            cantidad: 0,
            ingresos: 0,
          }
        }
        acumulado[item.id].cantidad += item.cantidad
        acumulado[item.id].ingresos += subtotalDe(item)
      })
    })
    return Object.values(acumulado)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 8)
  }, [ventasRango])

  const formatearFecha = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  const exportarReporte = () => {
    const tituloAnterior = document.title
    document.title = `Reporte ${fechaInicio} a ${fechaFin}`
    const restaurar = () => {
      document.title = tituloAnterior
      window.removeEventListener('afterprint', restaurar)
    }
    window.addEventListener('afterprint', restaurar)
    window.print()
  }
  const rangoTitulo = `${formatearFecha(fechaInicio)} – ${formatearFecha(fechaFin)}`
  const rangoTexto = rangoTitulo

  function aplicarPreset(dias) {
    const fecha = new Date()
    const inicio = new Date()
    inicio.setDate(fecha.getDate() - (dias - 1))
    setDesde(isoFecha(inicio))
    setHasta(isoFecha(fecha))
  }

  return (
    <section className="admin__reportes">
      <Cabecera
        miga="Reportes"
        titulo="Reporte completo del negocio."
        subtitulo="Filtra por rango de fechas y revisa ingresos, ventas, balance y detalle por método, cajero y producto."
        acciones={
          <button type="button" className="ui__boton ui__boton--primario" onClick={exportarReporte}>
            <IconExport width="17" height="17" />
            Exportar reporte
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
          {CAJEROS_SEDE.map((nombre) => (
            <option key={nombre} value={nombre}>{nombre}</option>
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
          etiqueta="Utilidad estimada"
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
          titulo={`Balance · ${formatearFecha(fechaInicio)} – ${formatearFecha(fechaFin)}${cajero !== 'todos' ? ` · ${cajero}` : ''}${metodo !== 'todos' ? ` · ${METODOS_PAGO[metodo].etiqueta}` : ''}`}
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
    </section>
  )
}

export default AdminReportes

