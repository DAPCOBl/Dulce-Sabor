import { useState } from 'react'
import Login from './pages/Login'
import Home from './pages/Home'
import { getSession, logout } from './services/auth'

function App() {
  const [session, setSession] = useState(getSession)

  function handleLogout() {
    logout()
    setSession(null)
  }

  if (!session) {
    return <Login onLogin={setSession} />
  }

  return <Home session={session} onLogout={handleLogout} />
}

export default App
