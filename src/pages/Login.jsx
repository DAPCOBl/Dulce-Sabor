import BrandPanel from '../components/BrandPanel'
import LoginForm from '../components/LoginForm'
import './Login.css'

function Login({ onLogin }) {
  return (
    <main className="login">
      <BrandPanel />

      <section className="login__panel">
        <div className="login__inner">
          <header className="login__header">
            <h1 className="login__title">Qué gusto verte.</h1>
            <p className="login__subtitle">Ingresa con tu cuenta para comenzar el día.</p>
          </header>

          <LoginForm onLogin={onLogin} />
        </div>

        <footer className="login__footer">Dulce Sabor · Hecho con cariño</footer>
      </section>
    </main>
  )
}

export default Login
