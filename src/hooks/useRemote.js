import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { getRevision, invalidarDatos, subscribeData } from '../services/datos.js'
import { getAuthState, subscribeSession } from '../services/session.js'

export function useRemote(load, dependencies = []) {
  const revision = useSyncExternalStore(subscribeData, getRevision, getRevision)
  const { session } = useSyncExternalStore(subscribeSession, getAuthState, getAuthState)
  const token = session?.token
  const loader = useRef(load)
  useEffect(() => { loader.current = load })
  const key = JSON.stringify([token, revision, ...dependencies])
  const [state, setState] = useState({ key: '', token: null, data: null, loading: true, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    Promise.resolve().then(() => loader.current({ signal: controller.signal })).then(data => {
      if (!controller.signal.aborted) setState({ key, token, data, loading: false, error: '' })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, token, data: null, loading: false, error: error.message })
    })
    return () => controller.abort()
  }, [key, token])
  const result = state.key === key ? state : { data: state.token === token ? state.data : null, loading: true, error: '' }
  return { data: result.data, loading: result.loading, error: result.error, retry: invalidarDatos }
}
