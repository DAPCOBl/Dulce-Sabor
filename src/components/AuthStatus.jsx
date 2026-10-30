import '../pages/Login.css'

function AuthStatus({ title, message, onRetry, onLogout }) {
  return (
    <main className="auth-status" aria-busy={!onRetry}>
      <section className="auth-status__card" aria-labelledby="auth-status-title">
        <h1 id="auth-status-title">{title}</h1>
        <p role={onRetry ? 'alert' : 'status'}>{message}</p>
        {onRetry && <button className="form__submit" onClick={onRetry}>Reintentar</button>}
        {onLogout && <button className="form__link" onClick={onLogout}>Volver al inicio de sesión</button>}
      </section>
    </main>
  )
}

export default AuthStatus
