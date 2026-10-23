import AdminHome from './admin/AdminHome'
import CajeroHome from './cajero/CajeroHome'
import { isAdministrador } from '../services/auth'

function Home({ session, onLogout }) {
  if (isAdministrador(session)) {
    return <AdminHome session={session} onLogout={onLogout} />
  }

  return <CajeroHome session={session} onLogout={onLogout} />
}

export default Home
