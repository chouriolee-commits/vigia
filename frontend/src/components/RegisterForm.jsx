import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../utils/validators'
import './AuthCard.css'

// RF8/RF9 exigen contraseña >= 6 caracteres: no hay validador compartido para esto en
// utils/validators.js, así que la constante y el chequeo viven aquí (scope propio de este
// componente, sin tocar utils/validators.js — ver notas del reporte final).
const MIN_PASSWORD_LENGTH = 6

// specs/013-authentication/requirements.md RF8-RF9 — formulario de registro (mock), con
// auto-login tras éxito (lo maneja useAuth().register internamente).
export default function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fieldsFilled = name.trim() !== '' && email.trim() !== '' && password !== '' && confirmPassword !== ''

  async function handleSubmit(event) {
    event.preventDefault()

    if (!fieldsFilled) {
      setError('Completa todos los campos.')
      return
    }
    if (!isValidEmail(email)) {
      setError('Ingresa un correo válido.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`)
      return
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)
    setError('')
    const result = await register(name, email, password)
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
        <label htmlFor="register-name">Nombre</label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="register-email">Correo electrónico</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="register-password">Contraseña</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <div className="auth-form__field">
        <label htmlFor="register-confirm-password">Confirmar contraseña</label>
        <input
          id="register-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </div>

      {error && (
        <p className="auth-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="auth-form__submit" disabled={!fieldsFilled || submitting}>
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  )
}
