import { useState } from 'react'
import Modal, { ModalDatos, ModalFila, ModalItems, ModalTotal } from '../ui/Modal'
import { IconImprimir, IconSales } from '../ui/icons'
import { formatFecha, fechaDiaMes, moneda } from '../ui/format'
import { metodoDePago } from '../ui/metodos'
import { DATOS_SEDE } from '../../data/ventas'
import { subtotalDe } from '../../data/precios'
import './ventas.css'

// Componente unificado para el comprobante de una venta. Se usa tanto en el
// punto de venta (variante "pos") como en el historial de la sede del
// administrador (variante "admin"), evitando mantener dos modales duplicados.
function VentaDetalle({ venta, onCerrar, cajero, onImprimir, fecha, variante = 'pos' }) {
  const [hoy] = useState(() => new Date())

  if (variante === 'admin') {
    const metodo = metodoDePago(venta.metodo)
    const IconoMetodo = metodo.Icono

    return (
      <Modal
        onCerrar={onCerrar}
        titulo={`Venta ${venta.folio}`}
        subtitulo={`Comprobante de venta · ${fechaDiaMes(fecha ?? hoy)}`}
        icono={<IconSales width="24" height="24" />}
        ancho
        acciones={
          <>
            <button type="button" className="ui__boton ui__boton--secundario" onClick={onCerrar}>
              Cerrar
            </button>
            {onImprimir && (
              <button
                type="button"
                className="ui__boton ui__boton--primario"
                onClick={onImprimir}
              >
                <IconImprimir width="16" height="16" />
                Imprimir comprobante
              </button>
            )}
          </>
        }
      >
        <ModalDatos>
          <ModalFila etiqueta="Hora">{venta.hora}</ModalFila>
          <ModalFila etiqueta="Cajero">{venta.cajero ?? cajero}</ModalFila>

          <ModalFila etiqueta="Método de pago">
            <IconoMetodo width="15" height="15" />
            {metodo.etiqueta}
          </ModalFila>
        </ModalDatos>

        <ModalItems
          items={venta.items}
          renderDetalle={(item) => `${item.cantidad} unidades × ${moneda(item.precio)}`}
          subtotales={(item) => moneda(subtotalDe(item))}
        />

        <ModalTotal etiqueta="Total de la venta">
          {moneda(venta.importe)} <em>COP</em>
        </ModalTotal>
      </Modal>
    )
  }

  const metodo = metodoDePago(venta.metodo)
  const IconoMetodo = metodo.Icono

  return (
    <Modal
      onCerrar={onCerrar}
      titulo={`Venta ${venta.folio}`}
      subtitulo="Comprobante de venta"
      icono={<IconSales width="28" height="28" />}
      ancho
      acciones={
        <button type="button" className="ui__boton ui__boton--secundario" onClick={onCerrar}>
          Cerrar
        </button>
      }
    >
      <ModalDatos>
        <ModalFila etiqueta="Fecha">{formatFecha(fecha ?? hoy)}</ModalFila>
        <ModalFila etiqueta="Hora">{venta.hora}</ModalFila>
        <ModalFila etiqueta="Método de pago">
          <span className={`ventas__metodo ventas__metodo--${venta.metodo}`}>
            <IconoMetodo width="15" height="15" />
            {metodo.etiqueta}
          </span>
        </ModalFila>
        <ModalFila etiqueta="Cajero">{cajero ?? venta.cajero}</ModalFila>
        <ModalFila etiqueta="Sucursal">{DATOS_SEDE.sucursal}</ModalFila>
      </ModalDatos>

      <ModalItems
        items={venta.items}
        renderDetalle={(item) => `${item.cantidad} × ${moneda(item.precio)} ${DATOS_SEDE.moneda}`}
        subtotales={(item) => moneda(subtotalDe(item))}
      />

      <ModalTotal etiqueta="Total de la venta">
        {moneda(venta.importe)} <em>{DATOS_SEDE.moneda}</em>
      </ModalTotal>
    </Modal>
  )
}

export default VentaDetalle

