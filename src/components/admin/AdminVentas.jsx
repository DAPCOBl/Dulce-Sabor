import { useMemo, useState } from 'react'
import {
  IconCalendar,
  IconCash,
  IconEye,
  IconImprimir,
  IconPlus,
  IconSales,
  IconSuccess,
  IconTicket,
  IconUser,
  IconWarning,
} from '../ui/icons'
import { fechaDiaMes, isoFecha, moneda, pluralVentas } from '../ui/format'
import { METODOS_PAGO } from '../ui/metodos'
import Buscador from '../ui/Buscador'
import Cabecera from '../ui/Cabecera'
import Filtro, { FiltroFecha } from '../ui/Filtro'
import Kpi from '../ui/Kpi'
import Paginacion from '../ui/Paginacion'
import Toast from '../ui/Toast'
import Vacio from '../ui/Vacio'
import { useAviso } from '../ui/useAviso'
import {
  CAJEROS_SEDE,
  HISTORIAL_SEDE,
  VENTA_PENDIENTE,
  VENTAS_SEDE,
  fechaDeVenta,
} from '../../data/ventasSede'
import DetalleVenta from './DetalleVenta'
import './adminVentas.css'

const POR_PAGINA = 4

const OPCIONES_CAJERO = [
  { valor: 'todos', etiqueta: 'Cajero: todos' },
  ...CAJEROS_SEDE.map((nombre) => ({ valor: nombre, etiqueta: `Cajero: ${nombre}` })),
]

const OPCIONES_METODO = [
  { valor: 'todos', etiqueta: 'Pago: todos' },
  ...Object.entries(METODOS_PAGO).map(([valor, metodo]) => ({
    valor,
    etiqueta: `Pago: ${metodo.etiqueta}`,
  })),
]

const OPCIONES_ESTADO = [
  { valor: 'Confirmadas', etiqueta: 'Confirmadas' },
  { valor: 'Pendientes', etiqueta: 'Pendientes' },
  { valor: 'Todas', etiqueta: 'Todas' },
]

function AdminVentas() {
  const [hoy] = useState(() => new Date())
  const [busqueda, setBusqueda] = useState('')
  const [fecha, setFecha] = useState(() => isoFecha(new Date()))
  const [cajero, setCajero] = useState('todos')
  const [metodo, setMetodo] = useState('todos')
  const [estado, setEstado] = useState('Confirmadas')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [aviso, mostrarAviso] = useAviso()

  // Ingresos y ventas del día en curso (los cobros confirmados de la sede).
  const resumen = useMemo(() => {
    const delDia = VENTAS_SEDE.filter((venta) => venta.dia === 0 && venta.estado === 'Confirmada')
    const ingresos = delDia.reduce((acumulado, venta) => acumulado + venta.importe, 0)
    return {
      ingresos,
      ventas: delDia.length,
      ticket: ingresos / delDia.length,
      pendiente: VENTA_PENDIENTE.importe,
    }
  }, [])

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()

    return HISTORIAL_SEDE.filter((venta) => {
      const coincideFecha = isoFecha(fechaDeVenta(venta, hoy)) === fecha
      const coincideCajero = cajero === 'todos' || venta.cajero === cajero
      const coincideMetodo = metodo === 'todos' || venta.metodo === metodo
      const coincideEstado =
        estado === 'Todas' ||
        (estado === 'Confirmadas' && venta.estado === 'Confirmada') ||
        (estado === 'Pendientes' && venta.estado === 'Pendiente')
      const coincideFolio = termino === '' || venta.folio.toLowerCase().includes(termino)
      return coincideFecha && coincideCajero && coincideMetodo && coincideEstado && coincideFolio
    })
  }, [busqueda, cajero, estado, fecha, hoy, metodo])

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, paginas)
  const visibles = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA)
  const totalVisible = filtradas.reduce((acumulado, venta) => acumulado + venta.importe, 0)

  function actualizarFiltro(setter) {
    return (valor) => {
      setter(valor)
      setPagina(1)
    }
  }

  function cambiarFecha(valor) {
    if (!valor) return
    setFecha(valor)
    setPagina(1)
  }

  function imprimir(venta) {
    mostrarAviso(`Comprobante ${venta.folio} enviado a la impresora de la sede`)
  }

  return (
    <section className="admin__ventas">
      <Cabecera
        miga="Ventas"
        titulo="Todas las ventas de tu sede."
        subtitulo="Consulta el historial global, el detalle de cada cobro y sus comprobantes."
        acciones={
          <button
            type="button"
            className="ui__boton ui__boton--primario"
            onClick={() =>
              mostrarAviso('Las ventas se registran desde el punto de venta del cajero')
            }
          >
            <IconPlus width="17" height="17" />
            Nueva venta
          </button>
        }
      />

      <p className="admin__meta-sede">
        <IconSales width="15" height="15" />
        Sede principal · Todos los cajeros y turnos · {fechaDiaMes(hoy)} · COP
      </p>

      <section className="ui__kpis" aria-label="Indicadores de ventas">
        <Kpi
          oscuro
          etiqueta="Ingresos de hoy"
          valor={moneda(resumen.ingresos)}
          unidad="COP"
          icono={<IconSales width="17" height="17" />}
          nota="Solo ventas de la sede"
        />

        <Kpi
          etiqueta="Ventas"
          valor={resumen.ventas}
          icono={<IconSuccess width="17" height="17" />}
          nota="Todos los cajeros · Todos los turnos"
        />

        <Kpi
          etiqueta="Ticket medio"
          valor={moneda(resumen.ticket)}
          unidad="COP"
          icono={<IconTicket width="17" height="17" />}
          nota={`Ingresos de hoy ÷ ${resumen.ventas} ventas`}
        />

        <Kpi
          etiqueta="Venta pendiente"
          valor={moneda(resumen.pendiente)}
          unidad="COP"
          icono={<IconWarning width="17" height="17" />}
          iconoTono="alerta"
          nota={`${VENTA_PENDIENTE.folio} · No incluida en ingresos`}
        />
      </section>

      <section className="admin__listado" aria-label="Ventas">
        <header className="admin__listado-cabecera">
          <div>
            <h2 className="admin__listado-titulo">Ventas</h2>
            <p className="admin__listado-sub">
              Historial de cobros de la sede principal por folio, cajero y método de pago
            </p>
          </div>
          <span className="admin__listado-alcance">
            Todos los cajeros · Todos los turnos
          </span>
        </header>

        <div className="ui__filtros">
          <Buscador
            valor={busqueda}
            onChange={actualizarFiltro(setBusqueda)}
            placeholder="Buscar por folio, ej. DS-0247"
            etiqueta="Buscar por folio"
          />

          <FiltroFecha
            icono={<IconCalendar width="16" height="16" />}
            valor={fecha}
            onChange={cambiarFecha}
            texto={fechaDiaMes(new Date(`${fecha}T12:00:00`))}
            ariaLabel="Seleccionar fecha del historial"
          />

          <Filtro
            icono={<IconUser width="16" height="16" />}
            etiqueta={cajero === 'todos' ? 'Cajero: todos' : `Cajero: ${cajero}`}
            valor={cajero}
            onChange={actualizarFiltro(setCajero)}
            opciones={OPCIONES_CAJERO}
            ariaLabel="Filtrar por cajero"
          />

          <Filtro
            icono={<IconCash width="16" height="16" />}
            etiqueta={
              metodo === 'todos' ? 'Pago: todos' : `Pago: ${METODOS_PAGO[metodo].etiqueta}`
            }
            valor={metodo}
            onChange={actualizarFiltro(setMetodo)}
            opciones={OPCIONES_METODO}
            ariaLabel="Filtrar por método de pago"
          />

          <Filtro
            icono={<IconSuccess width="16" height="16" />}
            etiqueta={estado}
            valor={estado}
            onChange={actualizarFiltro(setEstado)}
            opciones={OPCIONES_ESTADO}
            ariaLabel="Filtrar por estado"
          />
        </div>

        {visibles.length > 0 ? (
          <div className="ui__tabla-wrap">
            <table className="ui__tabla ui__tabla--ventas">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Folio</th>
                  <th>Cajero / Caja</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th className="admin__col-total">Total COP</th>
                  <th className="admin__col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((venta) => {
                  const metodoVenta = METODOS_PAGO[venta.metodo]
                  const IconoMetodo = metodoVenta.Icono
                  const pendiente = venta.estado === 'Pendiente'

                  return (
                    <tr key={venta.id}>
                      <td className="admin__hora">{venta.hora}</td>
                      <td className="admin__folio">{venta.folio}</td>
                      <td>
                        <div className="admin__cajero-celda">
                          <p className="admin__cajero-nombre">{venta.cajero}</p>
                          <p className="admin__cajero-detalle">
                            {venta.caja} · {venta.turno}
                          </p>
                        </div>
                      </td>
                      <td>
                        <span className={`admin__pago admin__pago--${venta.metodo}`}>
                          <IconoMetodo width="14" height="14" />
                          {metodoVenta.etiqueta}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin__estado${pendiente ? ' admin__estado--pendiente' : ''}`}
                        >
                          <span className="admin__estado-punto" />
                          {venta.estado}
                        </span>
                      </td>
                      <td className="admin__col-total admin__total">{moneda(venta.importe)}</td>
                      <td className="admin__col-acciones">
                        <div className="admin__acciones">
                          <button
                            type="button"
                            className="admin__accion"
                            onClick={() => setDetalle(venta)}
                          >
                            Detalle
                          </button>
                          <button
                            type="button"
                            className="admin__accion-icono"
                            aria-label={`Ver comprobante ${venta.folio}`}
                            onClick={() => setDetalle(venta)}
                          >
                            <IconEye width="16" height="16" />
                          </button>
                          <button
                            type="button"
                            className="admin__accion-icono"
                            aria-label={`Imprimir comprobante ${venta.folio}`}
                            onClick={() => imprimir(venta)}
                          >
                            <IconImprimir width="16" height="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Vacio
            titulo="No hay ventas que coincidan con los filtros seleccionados."
            detalle="Prueba con otra fecha, cajero o método de pago."
          />
        )}

        <footer className="admin__listado-pie">
          <Paginacion
            pagina={paginaActual}
            paginas={paginas}
            onPagina={setPagina}
            texto={`Mostrando ${visibles.length} de ${pluralVentas(filtradas.length)} de la sede · No es el total del turno`}
            extra={
              <span className="admin__listado-total">
                Total visible
                <strong>
                  {moneda(totalVisible)} COP
                </strong>
              </span>
            }
          />
        </footer>
      </section>

      <footer className="admin__nota">
        <p>
          <strong>Prototipo.</strong> Los datos son de demostración: 38 ventas del
          turno en curso y una venta pendiente que aún no suma a los ingresos del día.
        </p>
        <p>
          El total del turno de cada cajero se consulta desde su punto de venta; aquí se ve el
          histórico global de la sede.
        </p>
      </footer>

      {detalle && (
        <DetalleVenta
          venta={detalle}
          fecha={fechaDeVenta(detalle, hoy)}
          onCerrar={() => setDetalle(null)}
          onImprimir={() => imprimir(detalle)}
        />
      )}

      <Toast mensaje={aviso} icono={<IconSuccess width="17" height="17" />} />
    </section>
  )
}

export default AdminVentas
