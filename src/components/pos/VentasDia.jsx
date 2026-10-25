import { useMemo, useState } from 'react'
import Cabecera from '../ui/Cabecera'
import Kpi, { KpiDesglosePagos } from '../ui/Kpi'
import Buscador from '../ui/Buscador'
import Vacio from '../ui/Vacio'
import { IconCash, IconCard, IconEye, IconPlus, IconSales, IconSuccess } from '../ui/icons'
import { moneda, pluralVentas } from '../ui/format'
import { metodoDePago } from '../ui/metodos'
import { DATOS_SEDE } from '../../data/ventas'
import './ventas.css'

function VentasDia({ ventas, onNuevaVenta, onVer }) {
  const [busqueda, setBusqueda] = useState('')
  const [metodo, setMetodo] = useState('todos')

  const totales = useMemo(() => {
    const acumulado = { efectivo: 0, tarjeta: 0 }
    let total = 0
    for (const venta of ventas) {
      total += venta.importe
      acumulado[venta.metodo] = (acumulado[venta.metodo] ?? 0) + venta.importe
    }
    return { total, ...acumulado }
  }, [ventas])

  const conteos = useMemo(
    () => ({
      todos: ventas.length,
      efectivo: ventas.filter((venta) => venta.metodo === 'efectivo').length,
      tarjeta: ventas.filter((venta) => venta.metodo === 'tarjeta').length,
    }),
    [ventas],
  )

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    return ventas.filter((venta) => {
      const coincideMetodo = metodo === 'todos' || venta.metodo === metodo
      const coincideFolio = termino === '' || venta.folio.toLowerCase().includes(termino)
      return coincideMetodo && coincideFolio
    })
  }, [ventas, metodo, busqueda])

  const totalFiltrado = filtradas.reduce((acc, venta) => acc + venta.importe, 0)

  const tabs = [
    { id: 'todos', etiqueta: 'Todos' },
    { id: 'efectivo', etiqueta: 'Efectivo' },
    { id: 'tarjeta', etiqueta: 'Tarjeta' },
  ]

  return (
    <section className="ventas">
      <Cabecera
        miga="Ventas del día"
        titulo="Ventas del día"
        subtitulo="Consulta las ventas cobradas y sus comprobantes del día."
        acciones={
          <button type="button" className="ui__boton ui__boton--primario" onClick={onNuevaVenta}>
            <IconPlus width="17" height="17" />
            Nueva venta
          </button>
        }
      />

      <div className="ui__kpis">
        <Kpi
          destacado
          etiqueta="Total del día"
          valor={moneda(totales.total)}
          unidad={DATOS_SEDE.moneda}
          nota={pluralVentas(conteos.todos)}
          icono={<IconSales width="17" height="17" />}
        />
        <Kpi
          etiqueta="Ventas"
          valor={String(conteos.todos)}
          icono={<IconSuccess width="17" height="17" />}
          extra={
            <KpiDesglosePagos
              efectivo={conteos.efectivo}
              tarjeta={conteos.tarjeta}
              total={conteos.todos}
            />
          }
        />
        <Kpi
          etiqueta="Efectivo"
          valor={moneda(totales.efectivo)}
          unidad={DATOS_SEDE.moneda}
          nota={pluralVentas(conteos.efectivo)}
          icono={<IconCash width="17" height="17" />}
        />
        <Kpi
          etiqueta="Tarjeta"
          valor={moneda(totales.tarjeta)}
          unidad={DATOS_SEDE.moneda}
          nota={pluralVentas(conteos.tarjeta)}
          icono={<IconCard width="17" height="17" />}
        />
      </div>

      <section className="ventas__listado" aria-label="Ventas">
        <header className="ventas__filtros">
          <Buscador
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar por folio, ej. DS-0247"
            etiqueta="Buscar por folio"
          />

          <div className="ventas__tabs" role="tablist" aria-label="Método de pago">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={metodo === tab.id}
                className={`ventas__tab${metodo === tab.id ? ' ventas__tab--activo' : ''}`}
                onClick={() => setMetodo(tab.id)}
              >
                {tab.etiqueta}
                <span className="ventas__tab-cuenta">{conteos[tab.id]}</span>
              </button>
            ))}
          </div>
        </header>

        {filtradas.length > 0 ? (
          <div className="ui__tabla-wrap">
            <table className="ui__tabla">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Folio</th>
                  <th>Método de pago</th>
                  <th className="ventas__col-importe">Importe</th>
                  <th className="ventas__col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((venta) => {
                  const metodoVenta = metodoDePago(venta.metodo)
                  const IconoMetodo = metodoVenta.Icono
                  return (
                    <tr key={venta.id}>
                      <td className="ventas__hora">{venta.hora}</td>
                      <td className="ventas__folio">{venta.folio}</td>
                      <td>
                        <span className={`ventas__metodo ventas__metodo--${venta.metodo}`}>
                          <IconoMetodo width="15" height="15" />
                          {metodoVenta.etiqueta}
                        </span>
                      </td>
                      <td className="ventas__importe">{moneda(venta.importe)}</td>
                      <td>
                        <div className="ventas__acciones">
                          <button
                            type="button"
                            className="ventas__accion"
                            aria-label={`Ver comprobante ${venta.folio}`}
                            onClick={() => onVer?.(venta)}
                          >
                            <IconEye width="15" height="15" />
                            <span className="ventas__accion-texto">Ver</span>
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
            titulo="No hay ventas que coincidan con tu búsqueda"
            detalle="Prueba con otro folio o cambia el filtro de método de pago."
          />
        )}

        <footer className="ventas__pie">
          <span>
            Mostrando {filtradas.length} de {ventas.length} ventas del día
          </span>
          <span className="ventas__total">
            Total del día
            <strong>
              {moneda(totalFiltrado)} {DATOS_SEDE.moneda}
            </strong>
          </span>
        </footer>
      </section>
    </section>
  )
}

export default VentasDia
