import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthCard from '../components/AuthCard'
import LoginHero from '../components/LoginHero'
import './LoginPage.css'

// specs/013-authentication/requirements.md — puerta de entrada pública antes del dashboard.
// Usuario ya autenticado que visita /login directamente → redirige a "/" (caso límite).
// LoginHero es puramente de presentación (auditoría visual) — AuthCard conserva su diseño.
//
// El fondo de cuadrícula/glow vive a nivel de página (cubre todo, incluso detrás del área
// del formulario) — no se ve detrás del card porque AuthCard tiene fondo opaco propio.
export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="login-page">
      <div className="login-page__backdrop" aria-hidden="true">
        <div className="login-page__grid" />
        <div className="login-page__scan" />
        <div className="login-page__glow" />
      </div>

      <div className="login-page__layout">
        <LoginHero />
        <AuthCard />
      </div>
    </div>
  )
}
