import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import RequireAuth from '../components/RequireAuth'
import AppShell from './AppShell'

function renderApp(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>LoginPage</div>} />
          <Route element={<RequireAuth />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<div>Dashboard</div>} />
              <Route path="/alertas" element={<div>Pantalla de alertas</div>} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
  window.localStorage.setItem('vigia_auth', JSON.stringify({ name: 'Demo', email: 'demo@vigia.co' }))
})

describe('AppShell — cerrar sesión', () => {
  it('click en "Cerrar sesión" limpia la sesión y una ruta protegida vuelve a redirigir a /login', () => {
    renderApp()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(screen.getByText('LoginPage')).toBeInTheDocument()
    expect(window.localStorage.getItem('vigia_auth')).toBeNull()
  })
})

describe('AppShell — "app-shell--fit" (dashboard sin scroll)', () => {
  it('se aplica en "/" (el dashboard, pensado para caber en una sola pantalla)', () => {
    const { container } = renderApp('/')
    expect(container.querySelector('.app-shell')).toHaveClass('app-shell--fit')
  })

  it('NO se aplica en otras rutas (tablas que sí deben poder scrollear con muchas filas)', () => {
    const { container } = renderApp('/alertas')
    expect(screen.getByText('Pantalla de alertas')).toBeInTheDocument()
    expect(container.querySelector('.app-shell')).not.toHaveClass('app-shell--fit')
  })
})
