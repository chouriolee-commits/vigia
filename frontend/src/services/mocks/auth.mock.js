// Usuarios "registrados" en memoria — se reinicia con cada recarga completa de la página.
// Ver specs/013-authentication/design.md: nunca se persiste en localStorage (solo la sesión activa).
export const DEMO_USER = { name: 'Demo', email: 'demo@vigia.co', password: 'vigia2026' }

let registeredUsers = [DEMO_USER]

export function findUser(email, password) {
  return registeredUsers.find((u) => u.email === email && u.password === password) ?? null
}

export function emailExists(email) {
  return registeredUsers.some((u) => u.email === email)
}

export function addUser({ name, email, password }) {
  const user = { name, email, password }
  registeredUsers = [...registeredUsers, user]
  return user
}
