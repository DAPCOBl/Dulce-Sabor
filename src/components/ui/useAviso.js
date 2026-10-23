import { useEffect, useRef, useState } from 'react'

// Aviso transitorio para las pantallas que confirman una acción (imprimir un
// comprobante, registrar una venta...). El mensaje se oculta solo.
export function useAviso(duracion = 3600) {
  const [mensaje, setMensaje] = useState('')
  const temporizadorRef = useRef(null)

  useEffect(() => {
    return () => window.clearTimeout(temporizadorRef.current)
  }, [])

  function mostrar(texto) {
    setMensaje(texto)
    window.clearTimeout(temporizadorRef.current)
    temporizadorRef.current = window.setTimeout(() => setMensaje(''), duracion)
  }

  function cerrar() {
    window.clearTimeout(temporizadorRef.current)
    setMensaje('')
  }

  return [mensaje, mostrar, cerrar]
}
