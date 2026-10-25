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
