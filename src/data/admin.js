export const SEDE = 'Sede principal'

// Cierre del día a nivel de sede, antes de los cobros de la sesión en curso.
// Los cobros del punto de venta se suman encima en vivo (ver services/estado.js).
export const RESUMEN_DIA = {
  ingresos: 4860,
  ventas: 38,
}

// Acumulado del mes en curso con su comparación contra el mes anterior.
export const RESUMEN_MES = {
  ingresos: 128450,
  comparacion: 8.4,
}

// Ingresos de los 6 días anteriores al de hoy. El séptimo día (el día en
// curso) se arma en vivo: RESUMEN_DIA.ingresos + ingresos de la sesión.
export const SERIE_SEMANAL = [4180, 4320, 5040, 6180, 4720, 3010]

// Estado financiero del mes en curso.
export const BALANCE_MES = {
  ingresos: 128450,
  costoProductosVendidos: 74200,
  gastosOperativos: 22070,
}

// La primera notificación se arma en vivo con el inventario real
// (ver pages/admin/AdminHome.jsx); estas son las fijas de la sede.
export const NOTIFICACIONES = [
  {
    id: 'n2',
    tipo: 'exito',
    titulo: 'Ventas por encima del objetivo',
    detalle: '+12,4% Frente al mes anterior',
  },
  {
    id: 'n3',
    tipo: 'info',
    titulo: 'Reporte mensual listo',
    detalle: 'Balance del 1 al 20 de octubre',
  },
]
