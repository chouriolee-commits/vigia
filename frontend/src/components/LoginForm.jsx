import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../utils/validators'
import './AuthCard.css'

// specs/013-authentication/requirements.md RF2-RF5 — formulario de login, validación de
// cliente (campos vacíos, formato de email), error visible sin borrar lo ya escrito.
export default function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldsFilled = email.trim() !== '' && password !== ''

  async function handleSubmit(event) {
    event.preventDefault()

    if (!fieldsFilled) {
      setError('Completa correo y contraseña.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Ingresa un correo válido.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await login(email, password)
    setSubmitting(false)

    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__field">
        <label htmlFor="login-email">Correo electrónico</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="login-password">Contraseña</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="auth-form__submit" disabled={!fieldsFilled || submitting}>
        {submitting ? 'Ingresando…' : 'Iniciar sesión'}
      </button>

      <p className="auth-form__help">Credenciales de demo: demo@vigia.co / vigia2026</p>
    </form>
  )
}
