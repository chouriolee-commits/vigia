import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import RequireAuth from './RequireAuth'

function renderWithAuth(initialEntries) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route element={<RequireAuth />}>
            <Route path="/alertas" element={<div>AlertsPage</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('RequireAuth', () => {
  it('sin sesión, una ruta protegida redirige a /login', () => {
    renderWithAuth(['/alertas'])
    expect(screen.getByText('LoginPage')).toBeInTheDocument()
  })

  it('con sesión activa, renderiza la ruta protegida pedida', () => {
    window.localStorage.setItem('vigia_auth', JSON.stringify({ name: 'Demo', email: 'demo@vigia.co' }))
    renderWithAuth(['/alertas'])
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })
})
