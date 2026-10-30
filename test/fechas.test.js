import { test } from 'node:test'
import assert from 'node:assert/strict'
import { fechaComprobante, desplazarDia } from '../src/utils/fechas.js'
test('el comprobante conserva el día de Colombia al cambiar la zona del navegador', () => {
  const anterior = process.env.TZ
  try {
    process.env.TZ = 'America/Los_Angeles'
    assert.match(fechaComprobante('2026-10-30T05:30:00Z'), /viernes.*30.*octubre.*2026/)
    assert.match(fechaComprobante('2026-10-30T04:30:00Z'), /jueves.*29.*octubre.*2026/)
    assert.match(fechaComprobante('2026-10-30T05:30:00Z', true), /30/)
  } finally {
    if (anterior === undefined) delete process.env.TZ
    else process.env.TZ = anterior
  }
})
test('los rangos de fecha cruzan correctamente mes y año bisiesto', () => {
  assert.equal(desplazarDia('2024-03-01', -1), '2024-02-29')
  assert.equal(desplazarDia('2026-01-01', -1), '2025-12-31')
})
