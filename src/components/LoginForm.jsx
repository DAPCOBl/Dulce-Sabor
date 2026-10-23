import { useState } from 'react'
import { IconArrow, IconEye, IconEyeOff, IconLock, IconMail } from './ui/icons'
import { login } from '../services/auth'

const EMAIL_REMEMBER_KEY = 'dulcesabor:email'

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_REMEMBER_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState({})
  const [loginError, setLoginError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

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

    if (remember) {
      localStorage.setItem(EMAIL_REMEMBER_KEY, email.trim())
    } else {
      localStorage.removeItem(EMAIL_REMEMBER_KEY)
    }

    const result = login(email.trim(), password)
    if (!result.ok) {
      setPassword('')
      setLoginError(result.error)
      return
    }

    onLogin(result.session)
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
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
            autoComplete="email"
            placeholder="correo@dulcesabor.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        {errors.email && <p className="form__error">{errors.email}</p>}
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
        {errors.password && <p className="form__error">{errors.password}</p>}
      </div>

      <div className="form__options">
        <label className="form__checkbox">
          <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Recordar correo
        </label>
        <a className="form__link" href="#recuperar">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <button className="form__submit" type="submit">
        Iniciar sesión
        <IconArrow />
      </button>

      {loginError && <p className="form__error form__error--general">{loginError}</p>}
    </form>
  )
}

export default LoginForm
