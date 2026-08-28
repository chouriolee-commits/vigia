import { render, screen, act, cleanup } from '@testing-library/react'
import { AuthProvider, useAuth } from './useAuth'

function Probe() {
  const { isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'si' : 'no'}</span>
      <button onClick={() => login('demo@vigia.co', 'vigia2026')}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('useAuth', () => {
  it('tras login exitoso isAuthenticated es true y persiste releyendo localStorage (simula un refresh)', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('no')

    await act(async () => {
      screen.getByText('login').click()
    })
    expect(screen.getByTestId('status')).toHaveTextContent('si')
    expect(window.localStorage.getItem('vigia_auth')).toContain('demo@vigia.co')

    cleanup()

    // simula un refresh: nuevo árbol, nuevo AuthProvider que relee localStorage al montar
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('si')
  })

  it('logout limpia la sesión', () => {
    window.localStorage.setItem('vigia_auth', JSON.stringify({ name: 'Demo', email: 'demo@vigia.co' }))
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    )
    expect(screen.getByTestId('status')).toHaveTextContent('si')

    act(() => {
      screen.getByText('logout').click()
    })

    expect(screen.getByTestId('status')).toHaveTextContent('no')
    expect(window.localStorage.getItem('vigia_auth')).toBeNull()
  })
})
