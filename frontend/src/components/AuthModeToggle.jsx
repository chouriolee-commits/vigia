// specs/013-authentication/design.md — link de texto que alterna AuthCard entre
// modo login y modo registro, sin cambiar de ruta.
export default function AuthModeToggle({ mode, onToggle }) {
  const isLogin = mode === 'login'

  return (
    <button type="button" className="auth-card__toggle" onClick={onToggle}>
      {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
      <span className="auth-card__toggle-action">{isLogin ? 'Regístrate' : 'Inicia sesión'}</span>
    </button>
  )
}
