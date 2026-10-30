import Login from './pages/Login'
import Home from './pages/Home'
import AuthStatus from './components/AuthStatus'
import { useAuth } from './hooks/useAuth'

function App() {
  const { session, status, reason, error, retry, onLogout } = useAuth()
  if (status === 'closing') return <AuthStatus title="Cerrando sesión" message="Espera un momento." />
  if (status === 'anonymous') {
    const message = reason === 'expired' ? 'Tu sesión venció o fue cerrada. Vuelve a ingresar.'
      : reason === 'logout-offline' ? 'Se cerró la sesión en este navegador. No se pudo confirmar el cierre con el servidor.' : ''
    return <Login message={message} />
  }
  if (status === 'checking') return <AuthStatus title="Verificando tu sesión" message="Espera un momento para continuar." />
  if (status === 'error') return <AuthStatus title="No pudimos verificar tu sesión" message={error} onRetry={retry} onLogout={onLogout} />
  return <Home key={session.user.id} session={session} onLogout={onLogout} />
}

export default App
