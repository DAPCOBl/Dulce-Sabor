import { useEffect, useState } from 'react'
import { UNIDAD_POR_CATEGORIA } from '../../data/unidades'
import { generarSku } from '../../services/estado'
import Modal from '../ui/Modal'
import { IconInfo } from '../ui/icons'

const TITULOS = {
  editar: 'Editar producto',
  ver: 'Ver producto',
  nuevo: 'Nuevo producto',
}

function valoresIniciales(producto) {
  if (!producto) {
    return {
      nombre: '',
      sku: generarSku('Pan dulce'),
      categoria: 'Pan dulce',
      unidad: 'pieza',
      precio: '',
      coste: '',
      stockMinimo: '',
      estado: 'Activo',
    }
  }

  return {
    nombre: producto.nombre,
    sku: producto.sku,
    categoria: producto.categoria,
    precio: String(producto.precio),
    coste: String(producto.coste ?? 0),
    stockMinimo: String(producto.stockMinimo),
    estado: producto.estado,
  }
}

function ProductoEditor({
  producto,
  modo,
  categorias,
  unidades,
  estados,
  catalogo,
  onGuardar,
  onCancelar,
  onCerrar,
}) {
  const [form, setForm] = useState(() => valoresIniciales(producto))
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)
  const [skuEditado, setSkuEditado] = useState(Boolean(producto))

  const soloLectura = modo === 'ver'

  useEffect(() => {
    if (!guardado) return
    const timer = setTimeout(() => setGuardado(false), 2600)
    return () => clearTimeout(timer)
  }, [guardado])

  function actualizar(campo, valor) {
    setForm((actual) => ({ ...actual, [campo]: valor }))
    setErrores((actual) => ({ ...actual, [campo]: undefined }))
  }

  function cambiarCategoria(categoria) {
    setForm((actual) => {
      // La unidad acompaña a la categoría, salvo que el usuario ya la haya
      // elegido a mano.
      const sugerida = UNIDAD_POR_CATEGORIA[categoria] ?? actual.unidad
      const unidad = UNIDAD_POR_CATEGORIA[actual.categoria] === actual.unidad ? sugerida : actual.unidad

      return {
        ...actual,
        categoria,
        unidad,
        sku: skuEditado ? actual.sku : generarSku(categoria),
      }
    })
  }

  function validar() {
    const fallos = {}
    const nombre = form.nombre.trim()
    const sku = form.sku.trim().toUpperCase()

    if (!nombre) fallos.nombre = 'Escribe el nombre del producto.'
    if (!sku) fallos.sku = 'El SKU no puede quedar vacío.'
    else if (catalogo.some((otro) => otro.sku.toUpperCase() === sku && otro.id !== producto?.id)) {
      fallos.sku = 'Ya existe un producto con ese SKU.'
    }
    if (!Number.isFinite(Number(form.precio)) || Number(form.precio) < 0) {
      fallos.precio = 'Escribe un precio válido.'
    }
    if (!Number.isFinite(Number(form.coste)) || Number(form.coste) < 0) {
      fallos.coste = 'Escribe un coste de producción válido.'
    }
    if (!Number.isInteger(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0) {
      fallos.stockMinimo = 'Escribe un número entero válido.'
    }

    return fallos
  }

  function enviar(evento) {
    evento.preventDefault()
    const fallos = validar()
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    const ok = onGuardar({
      nombre: form.nombre.trim(),
      sku: form.sku.trim().toUpperCase(),
      categoria: form.categoria,
      unidad: form.unidad,
      precio: Number(form.precio),
      coste: Number(form.coste),
      stockMinimo: Number(form.stockMinimo),
      estado: form.estado,
    })

    if (ok) setGuardado(true)
  }

  function cancelar() {
    setErrores({})
    setGuardado(false)
    onCancelar()
  }

  const existencias = producto?.stock ?? 0
  const minimo = producto?.stockMinimo ?? 0
  const precio = Number(form.precio) || 0
  const coste = Number(form.coste) || 0
  const margen = precio - coste
  const margenPorcentaje = precio > 0 ? (margen / precio) * 100 : 0

  let aviso = 'Las existencias se registran desde el módulo de Inventario.'
  if (producto) {
    if (existencias <= 0) {
      aviso = `No hay existencias de ${producto.nombre}. Se generará una alerta en el inventario.`
    } else if (existencias <= minimo) {
      aviso = `Quedan ${existencias} unidades y el stock mínimo es de ${minimo}. Repón antes del próximo turno.`
    } else {
      aviso = `Hoy hay ${existencias} unidades en la sede principal. El stock mínimo es de ${minimo}, así que todavía hay margen.`
    }
  }

  return (
    <Modal
      onCerrar={onCerrar}
      titulo={TITULOS[modo]}
      subtitulo={producto ? producto.sku : 'Datos del catálogo'}
      lateral
      acciones={
        <>
          {guardado && <p className="admin__guardado">Cambios guardados en el catálogo.</p>}

          <div className="admin__panel-acciones">
            <button
              type="button"
              className="ui__boton ui__boton--secundario ui__boton--ancho"
              onClick={cancelar}
            >
              {soloLectura ? 'Cerrar' : 'Cancelar'}
            </button>

            {!soloLectura && (
              <button
                type="submit"
                form="producto-formulario"
                className="ui__boton ui__boton--primario ui__boton--ancho"
              >
                {modo === 'nuevo' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </>
      }
    >
      <form id="producto-formulario" className="admin__panel-cuerpo" onSubmit={enviar} noValidate>
        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="producto-nombre">
            Nombre del producto
          </label>
          <input
            id="producto-nombre"
            className={`admin__input${errores.nombre ? ' admin__input--error' : ''}`}
            type="text"
            value={form.nombre}
            onChange={(evento) => actualizar('nombre', evento.target.value)}
            disabled={soloLectura}
            aria-invalid={Boolean(errores.nombre)}
            placeholder="Pastel de chocolate"
          />
          {errores.nombre && <p className="admin__campo-error">{errores.nombre}</p>}
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="producto-sku">
            SKU
          </label>
          <input
            id="producto-sku"
            className={`admin__input admin__input--sku${errores.sku ? ' admin__input--error' : ''}`}
            type="text"
            value={form.sku}
            onChange={(evento) => {
              setSkuEditado(true)
              actualizar('sku', evento.target.value.toUpperCase())
            }}
            disabled={soloLectura}
            aria-invalid={Boolean(errores.sku)}
            placeholder="PAS-001"
          />
          {errores.sku && <p className="admin__campo-error">{errores.sku}</p>}
        </div>

        <div className="admin__campo-par">
          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="producto-categoria">
              Categoría
            </label>
            <select
              id="producto-categoria"
              className="admin__input admin__select-editor"
              value={form.categoria}
              onChange={(evento) => cambiarCategoria(evento.target.value)}
              disabled={soloLectura}
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="producto-unidad">
              Unidad de venta
            </label>
            <select
              id="producto-unidad"
              className="admin__input admin__select-editor"
              value={form.unidad}
              onChange={(evento) => actualizar('unidad', evento.target.value)}
              disabled={soloLectura}
            >
              {unidades.map((unidad) => (
                <option key={unidad} value={unidad}>
                  {unidad}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin__campo-par">
          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="producto-precio">
              Precio · COP
            </label>
            <div className="admin__input-monto">
              <span className="admin__input-prefijo">$</span>
              <input
                id="producto-precio"
                className={`admin__input admin__input--precio${errores.precio ? ' admin__input--error' : ''}`}
                type="number"
                min="0"
                step="50"
                value={form.precio}
                onChange={(evento) => actualizar('precio', evento.target.value)}
                disabled={soloLectura}
                aria-invalid={Boolean(errores.precio)}
                placeholder="0"
              />
            </div>
            {errores.precio && <p className="admin__campo-error">{errores.precio}</p>}
          </div>

          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="producto-coste">
              Coste de producción · COP
            </label>
            <div className="admin__input-monto">
              <span className="admin__input-prefijo">$</span>
              <input
                id="producto-coste"
                className={`admin__input admin__input--precio${errores.coste ? ' admin__input--error' : ''}`}
                type="number"
                min="0"
                step="50"
                value={form.coste}
                onChange={(evento) => actualizar('coste', evento.target.value)}
                disabled={soloLectura}
                aria-invalid={Boolean(errores.coste)}
                placeholder="0"
              />
            </div>
            {errores.coste && <p className="admin__campo-error">{errores.coste}</p>}
          </div>
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label">Margen estimado</label>
          <p className="admin__aviso-texto" style={{ margin: 0 }}>
            {`$${margen.toLocaleString('es-CO')} COP (${margenPorcentaje.toFixed(1)}%)`}
          </p>
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="producto-estado">
            Estado
          </label>
          <select
            id="producto-estado"
            className="admin__input admin__select-editor"
            value={form.estado}
            onChange={(evento) => actualizar('estado', evento.target.value)}
            disabled={soloLectura}
          >
            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className="admin__aviso">
          <span className="admin__aviso-icono">
            <IconInfo width="17" height="17" />
          </span>
          <div>
            <p className="admin__aviso-titulo">Existencias en sede</p>
            <p className="admin__aviso-texto">{aviso}</p>
          </div>
        </div>

      </form>
    </Modal>
  )
}

export default ProductoEditor
