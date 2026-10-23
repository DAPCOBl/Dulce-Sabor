import { useState } from 'react'
import { IconBread, IconCake, IconCup } from './icons'
import './ui.css'

// Icono que representa la categoría del producto. Si el producto no tiene
// foto, se dibuja este dibujo en lugar de la imagen.
export function IconoProducto({ categoria, ...props }) {
  if (categoria === 'Pasteles') return <IconCake {...props} />
  if (categoria === 'Bebidas') return <IconCup {...props} />
  return <IconBread {...props} />
}

// Miniatura de un producto para las tablas: la foto del catálogo o, si no hay
// o no carga, el icono de su categoría.
function ProductoMiniatura({ producto, tamano = 20 }) {
  const [fallo, setFallo] = useState(false)

  if (!producto.imagen || fallo) {
    return (
      <span className="ui__miniatura ui__miniatura--vacia">
        <IconoProducto categoria={producto.categoria} width={tamano} height={tamano} />
      </span>
    )
  }

  return (
    <img
      className="ui__miniatura"
      src={producto.imagen}
      alt=""
      loading="lazy"
      onError={() => setFallo(true)}
    />
  )
}

export default ProductoMiniatura
