import { useState } from 'react'
import Modal, { ModalDatos, ModalFila, ModalItems, ModalTotal } from '../ui/Modal'
import { IconSales } from '../ui/icons'
import { formatFecha, moneda } from '../ui/format'
import { metodoDePago } from '../ui/metodos'
import { TURNO } from '../../data/ventas'
import './ventas.css'

function VentaDetalle({ venta, onCerrar, cajero }) {
  const [hoy] = useState(() => new Date())

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
        <ModalFila etiqueta="Fecha">{formatFecha(hoy)}</ModalFila>
        <ModalFila etiqueta="Hora">{venta.hora}</ModalFila>
        <ModalFila etiqueta="Método de pago">
          <span className={`ventas__metodo ventas__metodo--${venta.metodo}`}>
            <IconoMetodo width="15" height="15" />
            {metodo.etiqueta}
          </span>
        </ModalFila>
        <ModalFila etiqueta="Cajero">{cajero}</ModalFila>
        <ModalFila etiqueta="Sucursal">{TURNO.sucursal}</ModalFila>
      </ModalDatos>

      <ModalItems
        items={venta.items}
        renderDetalle={(item) => `${item.cantidad} × ${moneda(item.precio)} ${TURNO.moneda}`}
        subtotales={(item) => moneda(item.precio * item.cantidad)}
      />

      <ModalTotal etiqueta="Total de la venta">
        {moneda(venta.importe)} <em>{TURNO.moneda}</em>
      </ModalTotal>
    </Modal>
  )
}

export default VentaDetalle
