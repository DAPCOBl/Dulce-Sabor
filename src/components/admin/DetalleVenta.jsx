import Modal, { ModalDatos, ModalFila, ModalItems, ModalTotal } from '../ui/Modal'
import { IconImprimir, IconSales } from '../ui/icons'
import { metodoDePago } from '../ui/metodos'
import { fechaDiaMes, moneda } from '../ui/format'

function DetalleVenta({ venta, fecha, onCerrar, onImprimir }) {
  const metodo = metodoDePago(venta.metodo)
  const IconoMetodo = metodo.Icono
  const pendiente = venta.estado === 'Pendiente'

  return (
    <Modal
      onCerrar={onCerrar}
      titulo={`Venta ${venta.folio}`}
      subtitulo={`Comprobante de venta · ${fechaDiaMes(fecha)}`}
      icono={<IconSales width="24" height="24" />}
      ancho
      acciones={
        <>
          <button type="button" className="ui__boton ui__boton--secundario" onClick={onCerrar}>
            Cerrar
          </button>
          <button
            type="button"
            className="ui__boton ui__boton--primario"
            onClick={onImprimir}
          >
            <IconImprimir width="16" height="16" />
            Imprimir comprobante
          </button>
        </>
      }
    >
      <ModalDatos>
        <ModalFila etiqueta="Hora">{venta.hora}</ModalFila>
        <ModalFila etiqueta="Cajero">{venta.cajero}</ModalFila>
        <ModalFila etiqueta="Caja / Turno">
          {venta.caja} · {venta.turno}
        </ModalFila>
        <ModalFila etiqueta="Método de pago">
          <IconoMetodo width="15" height="15" />
          {metodo.etiqueta}
        </ModalFila>
        <ModalFila etiqueta="Estado">
          <span className={`admin__estado${pendiente ? ' admin__estado--pendiente' : ''}`}>
            <span className="admin__estado-punto" />
            {venta.estado}
          </span>
        </ModalFila>
      </ModalDatos>

      <ModalItems
        items={venta.items}
        renderDetalle={(item) => `${item.cantidad} unidades × ${moneda(item.precio)}`}
        subtotales={(item) => moneda(item.precio * item.cantidad)}
      />

      <ModalTotal etiqueta="Total de la venta">
        {moneda(venta.importe)} <em>COP</em>
      </ModalTotal>
    </Modal>
  )
}

export default DetalleVenta
