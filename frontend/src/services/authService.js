// specs/013-authentication + 009-api-integration (fase 2, ya conectada):
// MVP usaba solo mock; ahora, con VITE_USE_MOCK=false, pega contra POST /api/auth/login|register
// del backend real (JWT). La interfaz (login/register/logout/getSession) no cambió.
import { addUser, emailExists, findUser } from './mocks/auth.mock'
import { apiFetch, USE_MOCK } from './api'

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

async function loginMock(email, password) {
  const match = findUser(email.trim(), password)
  if (!match) {
    return { ok: false, error: 'Correo o contraseña incorrectos' }
  }
  const user = { name: match.name, email: match.email }
  writeSession(user)
  return { ok: true, user }
}

async function registerMock(name, email, password) {
  const trimmedEmail = email.trim()
  if (emailExists(trimmedEmail)) {
    return { ok: false, error: 'Ese correo ya está registrado' }
  }
  addUser({ name: name.trim(), email: trimmedEmail, password })
  return loginMock(trimmedEmail, password)
}

async function loginReal(email, password) {
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), password }),
    })
    const user = { name: data.user.name, email: data.user.email, token: data.access_token }
    writeSession(user)
    return { ok: true, user }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

async function registerReal(name, email, password) {
  try {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
    })
    const user = { name: data.user.name, email: data.user.email, token: data.access_token }
    writeSession(user)
    return { ok: true, user }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

export const authService = {
  getSession() {
    return readSession()
  },

  async login(email, password) {
    return USE_MOCK ? loginMock(email, password) : loginReal(email, password)
  },

  async register(name, email, password) {
    return USE_MOCK ? registerMock(name, email, password) : registerReal(name, email, password)
  },

  logout() {
    clearSession()
  },
}
