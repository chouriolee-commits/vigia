import { useState } from 'react'
import DroneIllustration from './DroneIllustration'
import BrandLogo from './BrandLogo'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import AuthModeToggle from './AuthModeToggle'
import './AuthCard.css'

// specs/013-authentication/design.md — único contenedor visual: ilustración fija arriba,
// estado local `mode` alterna login/registro sin desmontar la ilustración ni cambiar de ruta.
export default function AuthCard() {
  const [mode, setMode] = useState('login')

  function toggleMode() {
    setMode((current) => (current === 'login' ? 'register' : 'login'))
  }

  return (
    <div className="auth-card">
      <DroneIllustration />

      <div className="auth-card__header">
        <BrandLogo size="lg" />
        <span className="auth-card__tagline">VIGILANCIA INTELIGENTE PARA LA GANADERÍA: IDENTIFICACIÓN DE ANOMALÍAS</span>
      </div>

      {mode === 'login' ? <LoginForm /> : <RegisterForm />}

      <AuthModeToggle mode={mode} onToggle={toggleMode} />
    </div>
  )
}
