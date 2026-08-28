import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Guard de rutas — specs/013-authentication/design.md.
// Sin sesión activa, cualquier ruta protegida redirige a /login.
export default function RequireAuth() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}
