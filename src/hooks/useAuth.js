import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { logout, validateSession } from '../services/auth.js'
import { clearSession, getAuthState, subscribeSession } from '../services/session.js'

export function useAuth() {
  const { session, reason } = useSyncExternalStore(subscribeSession, getAuthState, getAuthState)
  const [verification, setVerification] = useState({ token: null, status: 'checking', error: '' })
  const [attempt, setAttempt] = useState(0)
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)
  const token = session?.token
  const expiresAt = session?.expiresAt

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    let pending = false
    async function verify(blocking = false) {
      if (pending || controller.signal.aborted) return
      pending = true
      if (blocking) setVerification({ token, status: 'checking', error: '' })
      try {
        const checked = await validateSession({ signal: controller.signal })
        if (checked && !controller.signal.aborted) setVerification({ token, status: 'ready', error: '' })
      } catch (error) {
        if (!controller.signal.aborted && error.status !== 401) {
          setVerification({ token, status: 'error', error: error.message })
        }
      } finally { pending = false }
    }
    void verify(true)
    const onFocus = () => { if (document.visibilityState === 'visible') void verify() }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    const checkTimer = setInterval(onFocus, 60000)
    const expiryTimer = setTimeout(() => clearSession('expired', token), Math.max(0, expiresAt - Date.now()))
    return () => {
      controller.abort()
      clearInterval(checkTimer)
      clearTimeout(expiryTimer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [token, expiresAt, attempt])

  const onLogout = useCallback(async () => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    try { await logout() } finally { closingRef.current = false; setClosing(false) }
  }, [])
  const retry = useCallback(() => setAttempt(value => value + 1), [])

  return { session, reason, onLogout, retry,
    status: closing ? 'closing' : !session ? 'anonymous' : verification.token !== token ? 'checking' : verification.status,
    error: verification.error }
}
