import { authService } from './authService'

beforeEach(() => {
  window.localStorage.clear()
})

describe('authService', () => {
  it('login resuelve { ok: true } con la credencial demo', async () => {
    const result = await authService.login('demo@vigia.co', 'vigia2026')
    expect(result.ok).toBe(true)
    expect(result.user).toEqual({ name: 'Demo', email: 'demo@vigia.co' })
  })

  it('login resuelve { ok: false } con cualquier otra credencial', async () => {
    const result = await authService.login('demo@vigia.co', 'clave-incorrecta')
    expect(result).toEqual({ ok: false, error: 'Correo o contraseña incorrectos' })
  })

  it('register con un email nuevo agrega el usuario y resuelve { ok: true }', async () => {
    const email = `nueva-${Date.now()}@vigia.co`
    const result = await authService.register('Nueva Persona', email, 'clave123')
    expect(result.ok).toBe(true)
    expect(result.user).toEqual({ name: 'Nueva Persona', email })
  })

  it('register con un email ya existente (credencial demo) resuelve error, sin duplicar el usuario', async () => {
    const result = await authService.register('Otro Demo', 'demo@vigia.co', 'otra-clave')
    expect(result).toEqual({ ok: false, error: 'Ese correo ya está registrado' })

    // el usuario original no fue sobrescrito/duplicado: sigue entrando con su password original
    const login = await authService.login('demo@vigia.co', 'vigia2026')
    expect(login.ok).toBe(true)
  })

  it('un usuario recién registrado puede iniciar sesión de nuevo dentro de la misma sesión de pestaña', async () => {
    const email = `repetible-${Date.now()}@vigia.co`
    await authService.register('Repetible', email, 'clave123')
    authService.logout()

    const login = await authService.login(email, 'clave123')
    expect(login.ok).toBe(true)
    expect(login.user).toEqual({ name: 'Repetible', email })
  })
})
