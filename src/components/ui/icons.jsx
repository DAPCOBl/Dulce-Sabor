// Registro único de iconos de la aplicación. Todos los iconos provienen de
// Font Awesome (sólidos) y ambos módulos comparten el mismo lenguaje visual.

function claseIcono(nombre, className) {
  const clases = ['fa-solid', `fa-${nombre}`]
  if (className) clases.push(className)
  return clases.join(' ')
}

function estiloIcono(width, height, style) {
  const tamano = width ?? height
  const estilos = { ...style }
  if (tamano === undefined || tamano === null) return estilos

  const valor = String(tamano)
  if (/^\d+(\.\d+)?(px)?$/.test(valor)) {
    estilos.fontSize = valor.endsWith('px') ? valor : `${valor}px`
  } else {
    estilos.width = valor
    estilos.height = String(height ?? tamano)
  }

  return estilos
}

function IconoBase({ nombre, className, width, height, style, ...props }) {
  return (
    <i
      className={claseIcono(nombre, className)}
      style={estiloIcono(width, height, style)}
      aria-hidden="true"
      {...props}
    />
  )
}

/* ---------- Interfaz general ---------- */

export function IconSearch(props) {
  return <IconoBase nombre="magnifying-glass" {...props} />
}

export function IconTrash(props) {
  return <IconoBase nombre="trash" {...props} />
}

export function IconPlus(props) {
  return <IconoBase nombre="plus" {...props} />
}

export function IconMinus(props) {
  return <IconoBase nombre="minus" {...props} />
}

export function IconArrow(props) {
  return <IconoBase nombre="arrow-right" {...props} />
}

export function IconClose(props) {
  return <IconoBase nombre="xmark" {...props} />
}

export function IconWarning(props) {
  return <IconoBase nombre="triangle-exclamation" {...props} />
}

export function IconSuccess(props) {
  return <IconoBase nombre="circle-check" {...props} />
}

export function IconHelp(props) {
  return <IconoBase nombre="circle-question" {...props} />
}

export function IconExit(props) {
  return <IconoBase nombre="arrow-right-from-bracket" {...props} />
}

export function IconEye(props) {
  return <IconoBase nombre="eye" {...props} />
}

export function IconEyeOff(props) {
  return <IconoBase nombre="eye-slash" {...props} />
}

export function IconUser(props) {
  return <IconoBase nombre="user" {...props} />
}

export function IconMail(props) {
  return <IconoBase nombre="envelope" {...props} />
}

export function IconLock(props) {
  return <IconoBase nombre="lock" {...props} />
}

export function IconInfo(props) {
  return <IconoBase nombre="circle-info" {...props} />
}

export function IconExport(props) {
  return <IconoBase nombre="download" {...props} />
}

export function IconImprimir(props) {
  return <IconoBase nombre="print" {...props} />
}

export function IconHistorial(props) {
  return <IconoBase nombre="clock-rotate-left" {...props} />
}

export function IconEditar(props) {
  return <IconoBase nombre="pen-to-square" {...props} />
}

export function IconDesactivar(props) {
  return <IconoBase nombre="power-off" {...props} />
}

export function IconChevronIzq(props) {
  return <IconoBase nombre="chevron-left" {...props} />
}

export function IconChevronDer(props) {
  return <IconoBase nombre="chevron-right" {...props} />
}

export function IconTendenciaUp(props) {
  return <IconoBase nombre="arrow-trend-up" {...props} />
}

/* ---------- Ventas y punto de venta ---------- */

export function IconPos(props) {
  return <IconoBase nombre="cash-register" {...props} />
}

export function IconSales(props) {
  return <IconoBase nombre="receipt" {...props} />
}

export function IconCash(props) {
  return <IconoBase nombre="money-bill-1-wave" {...props} />
}

export function IconCard(props) {
  return <IconoBase nombre="credit-card" {...props} />
}

export function IconEmptyCart(props) {
  return <IconoBase nombre="cart-shopping" {...props} />
}

/* ---------- Catálogo e inventario ---------- */

export function IconProductos(props) {
  return <IconoBase nombre="boxes-stacked" {...props} />
}

export function IconInventario(props) {
  return <IconoBase nombre="truck-ramp-box" {...props} />
}

/* ---------- Secciones del panel de administración ---------- */

export function IconResumen(props) {
  return <IconoBase nombre="table-cells-large" {...props} />
}

export function IconReportes(props) {
  return <IconoBase nombre="chart-simple" {...props} />
}

export function IconUsuarios(props) {
  return <IconoBase nombre="users" {...props} />
}
