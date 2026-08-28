import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import LoginPage from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('LoginPage', () => {
  it('muestra el AuthCard cuando no hay sesión activa', () => {
    renderLoginPage()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
  })

  it('redirige a "/" si el usuario ya tiene sesión activa', () => {
    window.localStorage.setItem('vigia_auth', JSON.stringify({ name: 'Demo', email: 'demo@vigia.co' }))
    renderLoginPage()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
