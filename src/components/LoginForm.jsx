import { useRef, useState } from 'react'
import { IconArrow, IconEye, IconEyeOff, IconLock, IconMail } from './ui/icons'
import { login } from '../services/auth'

const EMAIL_REMEMBER_KEY = 'dulcesabor:email'

function LoginForm() {
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem(EMAIL_REMEMBER_KEY) ?? '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const pendingRef = useRef(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (pendingRef.current) return

    const nextErrors = {}
    if (!email.trim()) {
      nextErrors.email = 'Ingresá tu correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'El correo no tiene un formato válido.'
    }
    if (!password) {
      nextErrors.password = 'Ingresá tu contraseña.'
    }

    setErrors(nextErrors)
    setLoginError('')
    if (Object.keys(nextErrors).length > 0) return

    pendingRef.current = true
    setSubmitting(true)
    try {
      await login(email, password)
      try {
        if (remember) localStorage.setItem(EMAIL_REMEMBER_KEY, email.trim().toLowerCase())
        else localStorage.removeItem(EMAIL_REMEMBER_KEY)
      } catch { /* Recordar correo es opcional. */ }
      setPassword('')
    } catch (error) {
      setPassword('')
      setLoginError(error.message)
    } finally {
      pendingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <div className="form__field">
        <label className="form__label" htmlFor="email">
          Correo electrónico
        </label>
        <div className={`form__control${errors.email ? ' form__control--error' : ''}`}>
          <span className="form__icon">
            <IconMail />
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            disabled={submitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            placeholder="correo@dulcesabor.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {errors.email && <p id="email-error" className="form__error">{errors.email}</p>}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="password">
          Contraseña
        </label>
        <div className={`form__control${errors.password ? ' form__control--error' : ''}`}>
          <span className="form__icon">
            <IconLock />
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            disabled={submitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className="form__toggle"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <IconEyeOff /> : <IconEye />}
          </button>
        </div>
        {errors.password && <p id="password-error" className="form__error">{errors.password}</p>}
      </div>

      <div className="form__options">
        <label className="form__checkbox">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Recordar correo
        </label>
        <button className="form__link" type="button" onClick={() => setRecovery(value => !value)} aria-expanded={recovery} aria-controls="recovery-help">
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {recovery && <p id="recovery-help" className="form__help" role="status">Solicita al administrador que restablezca tu contraseña.</p>}

      <button className="form__submit" type="submit" disabled={submitting}>
        {submitting ? 'Ingresando…' : 'Iniciar sesión'}
        <IconArrow />
      </button>

      {loginError && <p className="form__error form__error--general" role="alert">{loginError}</p>}
    </form>
  )
}

export default LoginForm
