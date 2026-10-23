function BrandPanel() {
  return (
    <aside className="brand">
      <header className="brand__logo">
        <img className="brand__mark" src="/LogoW.svg" alt="Dulce Sabor" />
        <div>
          <p className="brand__name">Dulce Sabor</p>
          <p className="brand__tagline">Hecho con cariño</p>
        </div>
      </header>

      <div className="brand__content">
        <span className="brand__badge">Artesanía en cada detalle</span>
        <h2 className="brand__headline">El sabor de siempre.</h2>
      </div>
    </aside>
  )
}

export default BrandPanel
