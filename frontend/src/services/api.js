// Cliente HTTP base — specs/009-api-integration/design.md (fase 2).
// Hoy USE_MOCK es siempre true; cuando el backend exista, VITE_USE_MOCK=false activa apiFetch
// sin tocar componentes, hooks, ni el resto de los services.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Error ${res.status} al llamar a ${path}`)
  }
  return res.json()
}
