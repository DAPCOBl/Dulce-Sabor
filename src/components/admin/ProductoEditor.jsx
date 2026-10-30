import { useEffect, useRef, useState } from 'react'
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
      sku: '',
      categoria: 'Pan dulce',
      precio: '',
      coste: '',
      stockMinimo: '',
      estado: 'Activo',
       imagen: '',

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
     imagen: producto.imagen ?? '',

  }
}

function ProductoEditor({
  producto,
  modo,
  categorias,
  estados,
  catalogo,
  onGuardar,
  onCancelar,
  onCerrar,
}) {
  const [form, setForm] = useState(() => valoresIniciales(producto))
  const [errores, setErrores] = useState({})
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const pendingRef = useRef(false)

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

  function subirImagen(evento) {
    const archivo = evento.target.files?.[0]
    if (!archivo) return
    const lector = new FileReader()
    lector.onload = () => {
      actualizar('imagen', String(lector.result ?? ''))
    }
    lector.readAsDataURL(archivo)
  }


  function cambiarCategoria(categoria) {
    setForm((actual) => ({
      ...actual,
      categoria,

    }))
  }

  function validar() {
    const fallos = {}
    const nombre = form.nombre.trim()
    const sku = form.sku.trim().toUpperCase()

    if (!nombre) fallos.nombre = 'Escribe el nombre del producto.'
    if (!sku && producto) fallos.sku = 'El SKU no puede quedar vacío.'
    else if (sku && catalogo.some((otro) => otro.sku.toUpperCase() === sku && otro.id !== producto?.id)) {
      fallos.sku = 'Ya existe un producto con ese SKU.'
    }
    if (form.precio.trim() === '' || !Number.isInteger(Number(form.precio)) || Number(form.precio) < 0) {
      fallos.precio = 'Escribe un precio válido.'
    }
    if (form.coste.trim() === '' || !Number.isInteger(Number(form.coste)) || Number(form.coste) < 0) {
      fallos.coste = 'Escribe un coste de producción válido.'
    }
    if (!Number.isInteger(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0) {
      fallos.stockMinimo = 'Escribe un número entero válido.'
    }
     if (!form.imagen) fallos.imagen = 'Selecciona una imagen para el producto.'


    return fallos
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (pendingRef.current) return
    const fallos = validar()
    setErrores(fallos)
    if (Object.keys(fallos).length > 0) return

    pendingRef.current = true; setGuardando(true); setError('')
    try {
    const ok = await onGuardar({
      nombre: form.nombre.trim(),
      ...(form.sku.trim() ? { sku: form.sku.trim().toUpperCase() } : {}),
      categoria: form.categoria,
      precio: Number(form.precio),
      coste: Number(form.coste),
      stockMinimo: Number(form.stockMinimo),
      estado: form.estado,
       imagen: form.imagen,

    })

    if (ok) setGuardado(true)
    } catch (error) { setError(error.message) }
    finally { pendingRef.current = false; setGuardando(false) }
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
      aviso = `Quedan ${existencias} unidades y el stock mínimo es de ${minimo}. Repón lo antes posible.`
    } else {
      aviso = `Hoy hay ${existencias} unidades en la sede principal. El stock mínimo es de ${minimo}, así que todavía hay margen.`
    }
  }

  return (
    <Modal
      onCerrar={onCerrar}
      titulo={TITULOS[modo]}
      subtitulo={producto ? producto.sku : 'Datos del catálogo'}
       ancho
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
                disabled={guardando}
                className="ui__boton ui__boton--primario ui__boton--ancho"
              >
                {guardando ? 'Guardando…' : modo === 'nuevo' ? 'Crear producto' : 'Guardar cambios'}
              </button>
            )}
          </div>
        </>
      }
    >
      {error && <p className="ui__request-error" role="alert">{error}</p>}
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
            disabled={soloLectura || guardando}
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
              actualizar('sku', evento.target.value.toUpperCase())
            }}
            disabled={soloLectura || guardando}
            aria-invalid={Boolean(errores.sku)}
            placeholder="Automático si se deja vacío"
          />
          {errores.sku && <p className="admin__campo-error">{errores.sku}</p>}
        </div>

          <div className="admin__campo">
            <label className="admin__campo-label" htmlFor="producto-categoria">
              Categoría
            </label>
            <select
              id="producto-categoria"
              className="admin__input admin__select-editor"
              value={form.categoria}
              onChange={(evento) => cambiarCategoria(evento.target.value)}
              disabled={soloLectura || guardando}
            >
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>
         <div className="admin__campo">
           <label className="admin__campo-label" htmlFor="producto-imagen">
             Imagen (obligatoria)
           </label>
            <div className={`admin__imagen-carga${errores.imagen ? ' admin__imagen-carga--error' : ''}${soloLectura ? ' admin__imagen-carga--deshabilitada' : ''}`}>
              <input
                id="producto-imagen"
                className="admin__imagen-input"
                type="file"
                accept="image/*"
                onChange={subirImagen}
                disabled={soloLectura || guardando}
                aria-invalid={Boolean(errores.imagen)}
              />
              <label htmlFor="producto-imagen" className="admin__imagen-etiqueta">
                {form.imagen ? (
                  <img src={form.imagen} alt="" className="admin__imagen-preview" />
                ) : (
                  <span className="admin__imagen-placeholder" aria-hidden="true">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </span>
                )}
                <span className="admin__imagen-texto">
                  {form.imagen ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </span>
                <span className="admin__imagen-ayuda">
                  {form.imagen ? 'Imagen cargada correctamente.' : 'JPG, PNG o WebP. Obligatoria.'}
                </span>
              </label>
            </div>

           {errores.imagen && <p className="admin__campo-error">{errores.imagen}</p>}
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
                disabled={soloLectura || guardando}
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
                disabled={soloLectura || guardando}
                aria-invalid={Boolean(errores.coste)}
                placeholder="0"
              />
            </div>
            {errores.coste && <p className="admin__campo-error">{errores.coste}</p>}
          </div>
        </div>

        <div className="admin__campo">
          <label className="admin__campo-label" htmlFor="producto-stock-minimo">Stock mínimo</label>
          <input id="producto-stock-minimo" className="admin__input" type="number" min="0" step="1"
            value={form.stockMinimo} onChange={evento => actualizar('stockMinimo', evento.target.value)}
            disabled={soloLectura || guardando} aria-invalid={Boolean(errores.stockMinimo)} />
          {errores.stockMinimo && <p className="admin__campo-error">{errores.stockMinimo}</p>}
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
            disabled={soloLectura || guardando}
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
