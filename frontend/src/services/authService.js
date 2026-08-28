// MVP: autenticación simulada (mock). Fase futura: POST /api/auth/login|register
// contra backend real (specs/013-authentication/requirements.md RF11) — sin cambiar esta interfaz.
import { addUser, emailExists, findUser } from './mocks/auth.mock'

const SESSION_KEY = 'vigia_auth'

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(user) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    // localStorage no disponible (ej. navegación privada): la sesión sigue viva en memoria
    // durante la pestaña actual vía el estado de useAuth. Degradación aceptada (013, casos límite).
  }
}

function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // ver nota en writeSession
  }
}

export const authService = {
  getSession() {
    return readSession()
  },

  async login(email, password) {
    const match = findUser(email.trim(), password)
    if (!match) {
      return { ok: false, error: 'Correo o contraseña incorrectos' }
    }
    const user = { name: match.name, email: match.email }
    writeSession(user)
    return { ok: true, user }
  },

  async register(name, email, password) {
    const trimmedEmail = email.trim()
    if (emailExists(trimmedEmail)) {
      return { ok: false, error: 'Ese correo ya está registrado' }
    }
    addUser({ name: name.trim(), email: trimmedEmail, password })
    return authService.login(trimmedEmail, password)
  },

  logout() {
    clearSession()
  },
}
