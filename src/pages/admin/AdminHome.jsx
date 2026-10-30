import { useState } from 'react'
import PosSidebar from '../../components/pos/PosSidebar'
import AdminProductos from './AdminProductos'
import AdminUsuarios from '../../components/admin/AdminUsuarios'
import AdminReportes from '../../components/admin/AdminReportes'
import AdminVentas from '../../components/admin/AdminVentas'
import AlertasInventario from '../../components/admin/AlertasInventario'
import BalanceMes from '../../components/admin/BalanceMes'
import GraficoVentas from '../../components/admin/GraficoVentas'
import InventarioPanel from '../../components/admin/InventarioPanel'
import UltimasVentas from '../../components/admin/UltimasVentas'
import Cabecera from '../../components/ui/Cabecera'
import Kpi from '../../components/ui/Kpi'
import RemoteStatus from '../../components/ui/RemoteStatus'
import { SECCIONES } from '../../components/admin/secciones'
import { moneda, primerNombre, porcentaje, saludo } from '../../components/ui/format'
import { useRemote } from '../../hooks/useRemote'
import { resumenAdmin } from '../../services/reportes'
import '../../components/pos/pos.css'
import '../../components/admin/admin.css'

function ResumenNegocio({ session, onNavigate }) {
  const [reloj] = useState(() => new Date())
  const remote = useRemote(resumenAdmin)
  if (!remote.data) return <RemoteStatus {...remote} />
  const { resumenDia, resumenMes, inventario, balanceMes, serieSemanal, ultimasVentas, alertas } = remote.data
  return <>
    <Cabecera miga="Resumen del negocio" titulo={`${saludo(reloj)}, ${primerNombre(session.user.nombre)}.`} subtitulo="Resumen operativo y métricas de tu sede." />
    <RemoteStatus {...remote} />
    <section className="ui__kpis ui__kpis--tres admin__kpis-resumen" aria-label="Indicadores del día">
      <Kpi oscuro etiqueta="Ingresos de hoy" valor={moneda(resumenDia.ingresos)} unidad="COP" meta={<span>{resumenDia.ventas} ventas</span>} />
      <Kpi etiqueta="Ingresos del mes" valor={moneda(resumenMes.ingresos)} unidad="COP"
        meta={<span>{resumenMes.comparacion == null ? 'Sin base de comparación' : `${porcentaje(resumenMes.comparacion)} frente al mismo tramo del mes anterior`}</span>} />
      <Kpi etiqueta="Productos en alerta" valor={inventario.enAlerta} unidad="PRODUCTOS" meta={<span>{inventario.agotados} agotados · {inventario.bajos} con stock bajo</span>} />
    </section>
    <section className="admin__fila">
      <GraficoVentas serie={serieSemanal} total={serieSemanal.reduce((s,dia) => s + dia.valor, 0)} />
      <BalanceMes balance={balanceMes} onVerReporte={() => onNavigate('reportes')} />
    </section>
    <section className="admin__fila">
      <UltimasVentas ventas={ultimasVentas} onVerVentas={() => onNavigate('ventas')} />
      <AlertasInventario alertas={alertas} onVerInventario={() => onNavigate('inventario')} />
    </section>
  </>
}
function AdminHome({ session, onLogout }) {
  const [vista, setVista] = useState('resumen')
  return <div className="admin">
    <PosSidebar vista={vista} onNavigate={setVista} session={session} onLogout={onLogout} secciones={SECCIONES}
      menuTitulo="Administración" rolEtiqueta="Administrador" admin link="/guia/administrador" />
    <div className="admin__cuerpo"><main className="admin__principal pos__centro">
      {vista === 'inventario' ? <InventarioPanel session={session} />
        : vista === 'productos' ? <AdminProductos />
        : vista === 'usuarios' ? <AdminUsuarios session={session} />
        : vista === 'ventas' ? <AdminVentas />
        : vista === 'reportes' ? <AdminReportes />
        : <ResumenNegocio session={session} onNavigate={setVista} />}
    </main></div>
  </div>
}
export default AdminHome
