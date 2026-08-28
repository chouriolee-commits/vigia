import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import AuthCard from '../components/AuthCard'
import './LoginPage.css'

// specs/013-authentication/requirements.md — puerta de entrada pública antes del dashboard.
// Usuario ya autenticado que visita /login directamente → redirige a "/" (caso límite).
export default function LoginPage() {
  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="login-page">
      <AuthCard />
    </div>
  )
}
