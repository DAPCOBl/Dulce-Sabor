import { useEffect, useMemo, useState } from 'react'
import PosSidebar from '../../components/pos/PosSidebar'
import AdminProductos from './AdminProductos'
import AdminVentas from '../../components/admin/AdminVentas'
import AlertasInventario from '../../components/admin/AlertasInventario'
import BalanceMes from '../../components/admin/BalanceMes'
import GraficoVentas from '../../components/admin/GraficoVentas'
import InventarioPanel from '../../components/admin/InventarioPanel'
import UltimasVentas from '../../components/admin/UltimasVentas'
import Cabecera from '../../components/ui/Cabecera'
import Kpi from '../../components/ui/Kpi'
import '../../components/pos/pos.css'
import {
  IconArrow,
  IconCalendar,
  IconExport,
  IconSales,
  IconTendenciaUp,
} from '../../components/ui/icons'
import { SECCIONES } from '../../components/admin/secciones'
import {
  diaCorto,
  fechaDiaMes,
  isoFecha,
  moneda,
  primerNombre,
  porcentaje,
  periodoMes,
  periodoMesAnteriorCorto,
  saludo,
} from '../../components/ui/format'
import {
  BALANCE_MES,
  NOTIFICACIONES,
  RESUMEN_DIA,
  RESUMEN_MES,
  SERIE_SEMANAL,
} from '../../data/admin'
import { alertasDeInventario, useEstado } from '../../services/estado'
import '../../components/admin/admin.css'

// La primera notificación de la campana se arma con el inventario real.
function notificacionDeAlerta(alerta) {
  if (!alerta) return null
  const agotado = alerta.estado === 'agotado'
  return {
    id: `alerta-${alerta.id}`,
    tipo: agotado ? 'alerta' : 'info',
    titulo: agotado ? `${alerta.nombre} agotado` : `${alerta.nombre} con stock bajo`,
    detalle: agotado
      ? 'Sin unidades en stock · revisa el inventario'
      : `Quedan ${alerta.stock} de ${alerta.minimo} unidades`,
  }
}

function AdminHome({ session, onLogout }) {
  const [vista, setVista] = useState('resumen')
  const [fecha, setFecha] = useState(() => new Date())
  const [reloj, setReloj] = useState(() => new Date())
  const { ventas, productos, sesion } = useEstado()

  useEffect(() => {
    const timer = setInterval(() => setReloj(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const esHoy = isoFecha(fecha) === isoFecha(reloj)

  // Ingresos del día: la base de la sede más los cobros de la sesión en curso.
  const ingresosHoy = RESUMEN_DIA.ingresos + sesion.ingresos
  const ventasHoy = RESUMEN_DIA.ventas + sesion.ventas
  const ingresosMes = RESUMEN_MES.ingresos + sesion.ingresos
  const ticketMedio = ventasHoy > 0 ? ingresosHoy / ventasHoy : 0

  const serie = useMemo(() => {
    const valores = [...SERIE_SEMANAL, ingresosHoy]
    return valores.map((valor, indice) => {
      const dia = new Date(fecha)
      dia.setDate(fecha.getDate() - (valores.length - 1 - indice))
      const ultimo = indice === valores.length - 1
      return { valor, etiqueta: ultimo && esHoy ? 'Hoy' : diaCorto(dia) }
    })
  }, [fecha, esHoy, ingresosHoy])

  const totalSemana = useMemo(
    () => serie.reduce((acumulado, punto) => acumulado + punto.valor, 0),
    [serie],
  )

  const balance = useMemo(
    () => ({ ...BALANCE_MES, ingresos: BALANCE_MES.ingresos + sesion.ingresos }),
    [sesion.ingresos],
  )

  const alertas = useMemo(() => alertasDeInventario(productos), [productos])
  const agotados = alertas.filter((alerta) => alerta.estado === 'agotado').length
  const stockBajo = alertas.length - agotados

  const notificaciones = useMemo(() => {
    const dinamica = notificacionDeAlerta(alertas[0])
    return dinamica ? [dinamica, ...NOTIFICACIONES] : NOTIFICACIONES
  }, [alertas])

  const seccion = SECCIONES.find((item) => item.id === vista) ?? SECCIONES[0]
  const IconoSeccion = seccion.Icono

  function cambiarFecha(evento) {
    const valor = evento.target.value
    if (!valor) return
    setFecha(new Date(`${valor}T12:00:00`))
  }

  function exportarReporte() {
    const filas = [
      ['Dulce Sabor - Resumen del negocio'],
      ['Sede', 'Sede principal'],
      ['Fecha', fechaDiaMes(fecha)],
      [],
      ['Ingresos diarios'],
      ['Dia', 'Ingresos'],
      ...serie.map((punto) => [punto.etiqueta, punto.valor]),
      ['Acumulado del periodo', totalSemana],
      [],
      ['Balance del mes', periodoMes(fecha)],
      ['Concepto', 'Valor'],
      ['Ingresos', balance.ingresos],
      ['Costo de productos vendidos', balance.costoProductosVendidos],
      ['Gastos operativos', balance.gastosOperativos],
      [
        'Utilidad estimada',
        balance.ingresos - balance.costoProductosVendidos - balance.gastosOperativos,
      ],
    ]

    const csv = filas.map((fila) => fila.join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `resumen-dulce-sabor-${isoFecha(fecha)}.csv`
    enlace.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin">
      <PosSidebar
        vista={vista}
        onNavigate={setVista}
        session={session}
        onLogout={onLogout}
        secciones={SECCIONES}
        menuTitulo="Administración"
        rolEtiqueta="Administrador"
        admin
      />

      <div className="admin__cuerpo">
        <main className="admin__principal" style={{ paddingTop: 16 }}>
          {vista === 'inventario' ? (
            <InventarioPanel session={session} />
          ) : vista === 'productos' ? (
            <AdminProductos />
          ) : vista === 'ventas' ? (
            <AdminVentas />
          ) : vista === 'resumen' ? (
            <>
              <Cabecera
                miga="Resumen del negocio"
                titulo={`${saludo(reloj)}, ${primerNombre(session.user.nombre)}.`}
                  subtitulo="Resumen operativo y métricas clave de tu sede."
                acciones={
                  <>
                    <label className="ui__boton ui__boton--secundario ui__fecha">
                      <IconCalendar width="16" height="16" />
                      {fechaDiaMes(fecha)}
                      <input
                        type="date"
                        value={isoFecha(fecha)}
                        onChange={cambiarFecha}
                        aria-label="Seleccionar fecha del resumen"
                      />
                    </label>

                    <button
                      type="button"
                      className="ui__boton ui__boton--primario"
                      onClick={exportarReporte}
                    >
                      <IconExport width="16" height="16" />
                      Exportar reporte
                    </button>
                  </>
                }
              />

              <section className="ui__kpis ui__kpis--tres admin__kpis-resumen" aria-label="Indicadores del día">
                <Kpi
                  oscuro
                  etiqueta="Ingresos de hoy"
                  valor={moneda(ingresosHoy)}
                  unidad="COP"
                  icono={<IconSales width="17" height="17" />}
                  meta={
                    <span className="admin__kpi-linea">
                      <strong>{ventasHoy}</strong> ventas
                      <span className="admin__kpi-sep" aria-hidden="true">·</span>
                      Ticket medio {moneda(ticketMedio)}
                    </span>
                  }
                />

                <Kpi
                  etiqueta="Ingresos del mes"
                  valor={moneda(ingresosMes)}
                  unidad="COP"
                  icono={<IconTendenciaUp width="17" height="17" />}
                  meta={
                    <>
                      <span className="ui__tendencia ui__tendencia--sube">
                        <IconTendenciaUp width="14" height="14" />
                        {porcentaje(RESUMEN_MES.comparacion)}
                      </span>
                      <span>vs. {periodoMesAnteriorCorto(fecha)}</span>
                    </>
                  }
                />

                <Kpi
                  etiqueta="Productos en alerta"
                  valor={alertas.length}
                  unidad="PRODUCTOS"
                  meta={
                    <span className="admin__kpi-linea">
                      <span className="ui__tendencia ui__tendencia--alerta">
                        {agotados} agotado
                      </span>
              <span className="ui__tendencia ui__tendencia--baja">
                {stockBajo} con stock bajo
              </span>
                    </span>
                  }
                />
              </section>

              <section className="admin__fila">
                <GraficoVentas serie={serie} total={totalSemana} />
                <BalanceMes balance={balance} onVerReporte={() => setVista('reportes')} />
              </section>

              <section className="admin__fila">
                <UltimasVentas ventas={ventas} onVerVentas={() => setVista('ventas')} />
                <AlertasInventario
                  alertas={alertas}
                  onVerInventario={() => setVista('inventario')}
                />
              </section>

              <section className="admin__banner">
                <div className="admin__banner-texto">
                  <h2>Un catálogo tan cuidado como tus recetas.</h2>
                  <p>Crea, consulta, edita o da de baja productos desde tu catálogo.</p>
                </div>
                <button
                  type="button"
                  className="admin__banner-enlace"
                  onClick={() => setVista('productos')}
                >
                  Gestionar productos
                  <IconArrow width="16" height="16" />
                </button>
              </section>
            </>
          ) : (
            <section className="admin__placeholder">
              <span className="admin__placeholder-icono">
                <IconoSeccion width="24" height="24" />
              </span>
              <h2>{seccion.etiqueta}</h2>
              <p>
                Estamos horneando esta sección. Por ahora puedes revisar el
                resumen del negocio desde el menú lateral.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default AdminHome
