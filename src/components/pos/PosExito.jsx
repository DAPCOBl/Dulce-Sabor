import Modal, { ModalDatos, ModalFila } from '../ui/Modal'
import { IconPlus, IconSuccess } from '../ui/icons'
import { moneda } from '../ui/format'

function PosExito({ venta, onNuevaVenta }) {
  const esEfectivo = venta.metodo === 'efectivo'

  return (
    <Modal
      onCerrar={onNuevaVenta}
      titulo="¡Venta realizada!"
      subtitulo={`La venta ${venta.folio} quedó registrada.`}
      icono={<IconSuccess width="30" height="30" />}
      tono="exito"
      acciones={
        <button type="button" className="ui__boton ui__boton--primario ui__boton--ancho" onClick={onNuevaVenta}>
          <IconPlus width="18" height="18" />
          Iniciar nueva venta
        </button>
      }
    >
      <ModalDatos>
        <ModalFila etiqueta="Referencia">{venta.folio}</ModalFila>
        <ModalFila etiqueta="Total cobrado">{moneda(venta.importe)}</ModalFila>

        {esEfectivo ? (
          <>
            <ModalFila etiqueta="Efectivo recibido">{moneda(venta.recibido)}</ModalFila>
            <ModalFila etiqueta="Cambio a entregar">{moneda(venta.cambio)}</ModalFila>
          </>
        ) : (
          <ModalFila etiqueta="Método de pago">Tarjeta</ModalFila>
        )}
      </ModalDatos>
    </Modal>
  )
}

export default PosExito
