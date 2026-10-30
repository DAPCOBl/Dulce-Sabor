import { useState } from 'react'
import {
  IconEye,
  IconSales,
  IconSuccess,
} from '../ui/icons'
import { moneda, pluralVentas } from '../ui/format'
import { METODOS_PAGO } from '../ui/metodos'
import Buscador from '../ui/Buscador'
import Cabecera from '../ui/Cabecera'
import Kpi from '../ui/Kpi'
import Paginacion from '../ui/Paginacion'
import Toast from '../ui/Toast'
import Vacio from '../ui/Vacio'
import { useAviso } from '../ui/useAviso'
import { listarVentas, resumenVentas, opcionesVentas } from '../../services/ventas'
import { useRemote } from '../../hooks/useRemote'
import RemoteStatus from '../ui/RemoteStatus'
import VentaDetalle from '../pos/VentaDetalle'
import './adminVentas.css'
import '../pos/pos.css'

const POR_PAGINA = 4

const OPCIONES_METODO = [
  { valor: 'todos', etiqueta: 'Pago: todos' },
  ...Object.entries(METODOS_PAGO).map(([valor, metodo]) => ({
    valor,
    etiqueta: `Pago: ${metodo.etiqueta}`,
  })),
]

function AdminVentas() {
  const [busqueda, setBusqueda] = useState('')
  const [cajero, setCajero] = useState('todos')
  const [metodo, setMetodo] = useState('todos')
  const [pagina, setPagina] = useState(1)
  const [detalle, setDetalle] = useState(null)
  const [aviso] = useAviso()

  const remote = useRemote(async options => {
    const [lista, resumen, opciones] = await Promise.all([
      listarVentas({ busqueda, cajeroId: cajero, metodo, pagina, porPagina: POR_PAGINA }, options), resumenVentas({}, options), opcionesVentas(options),
    ])
    return { ...lista, resumen: resumen.resumen, opciones }
  }, [busqueda, cajero, metodo, pagina])
  const resumen = remote.data?.resumen
  const visibles = remote.data?.ventas ?? []
  const paginaActual = remote.data?.paginacion.pagina ?? 1
  const paginas = remote.data?.paginacion.paginas ?? 1
  const totalVisible = visibles.reduce((total, venta) => total + venta.importe, 0)
  const opcionesCajero = [{ valor: 'todos', etiqueta: 'Cajero: todos' }, ...(remote.data?.opciones.cajeros ?? []).map(usuario => ({ valor: usuario.id, etiqueta: usuario.nombre }))]

  function actualizarFiltro(setter) {
    return (valor) => {
      setter(valor)
      setPagina(1)
    }
  }

  return (
    <section className="admin__ventas">
      <Cabecera
        miga="Ventas"
        titulo="Todas las ventas de tu sede."
      />

      <RemoteStatus {...remote} />
      {remote.data && <>
      <section className="ui__kpis ui__kpis--dos" aria-label="Indicadores de ventas">
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
          nota="Todos los cajeros"
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
        </header>

        <div className="ui__filtros">
          <Buscador
            valor={busqueda}
            onChange={actualizarFiltro(setBusqueda)}
            placeholder="Buscar por folio, ej. DS-0247"
            etiqueta="Buscar por folio"
          />

<select
            className="pos__sucursal-select"
            value={cajero}
            onChange={(evento) => actualizarFiltro(setCajero)(evento.target.value)}
            aria-label="Filtrar por cajero"
          >
            {opcionesCajero.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>

          <select
            className="pos__sucursal-select"
            value={metodo}
            onChange={(evento) => actualizarFiltro(setMetodo)(evento.target.value)}
            aria-label="Filtrar por método de pago"
          >
            {OPCIONES_METODO.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </option>
            ))}
          </select>
        </div>

        {visibles.length > 0 ? (
          <div className="ui__tabla-wrap">
            <table className="ui__tabla ui__tabla--ventas">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Folio</th>
                  <th>Cajero</th>
                  <th>Pago</th>
                  <th className="admin__col-total">Total COP</th>
                  <th className="admin__col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((venta) => {
                  const metodoVenta = METODOS_PAGO[venta.metodo]
                  const IconoMetodo = metodoVenta.Icono

                  return (
                    <tr key={venta.id}>
                      <td className="admin__hora">{venta.hora}</td>
                      <td className="admin__folio">{venta.folio}</td>
                      <td>
                        <div className="admin__cajero-celda">
                          <p className="admin__cajero-nombre">{venta.cajero}</p>
                        </div>
                      </td>
                      <td>
                        <span className={`admin__pago admin__pago--${venta.metodo}`}>
                          <IconoMetodo width="14" height="14" />
                          {metodoVenta.etiqueta}
                        </span>
                      </td>
                      <td className="admin__col-total admin__total">{moneda(venta.importe)}</td>
                      <td className="admin__col-acciones">
                        <div className="admin__acciones">
                          <button
                            type="button"
                            className="admin__accion-icono"
                            aria-label={`Ver comprobante ${venta.folio}`}
                            onClick={() => setDetalle(venta)}
                          >
                            <IconEye width="16" height="16" />
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
            detalle="Prueba con otro cajero o método de pago."
          />
        )}

<footer className="admin__listado-pie">
          <p className="ui__paginacion-texto">
            {`Mostrando ${visibles.length} de ${pluralVentas(remote.data.paginacion.total)}`}
          </p>

          <Paginacion
            pagina={paginaActual}
            paginas={paginas}
            onPagina={setPagina}
          />

          <span className="admin__listado-total">
            Total de esta página
            <strong>
              {moneda(totalVisible)} COP
            </strong>
          </span>
        </footer>
      </section>

      {detalle && (
        <VentaDetalle
          variante="admin"
          venta={detalle}
          fecha={new Date(detalle.fecha)}
          onCerrar={() => setDetalle(null)}
        />
      )}

      </>}
      <Toast mensaje={aviso} icono={<IconSuccess width="17" height="17" />} />
    </section>
  )
}

export default AdminVentas
