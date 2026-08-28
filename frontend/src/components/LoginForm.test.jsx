import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import LoginForm from './LoginForm'

function renderLoginForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('LoginForm', () => {
  it('deshabilita el submit si algún campo está vacío', () => {
    renderLoginForm()
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'demo@vigia.co' } })
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled()

    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'vigia2026' } })
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).not.toBeDisabled()
  })

  it('con la credencial demo navega a "/"', async () => {
    renderLoginForm()
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'demo@vigia.co' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'vigia2026' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })

  it('muestra el error sin borrar lo ya escrito cuando la credencial es inválida', async () => {
    renderLoginForm()
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'demo@vigia.co' } })
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'incorrecta' } })
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/correo o contraseña incorrectos/i))
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('demo@vigia.co')
    expect(screen.getByLabelText(/contraseña/i)).toHaveValue('incorrecta')
  })

  it('muestra la ayuda de credenciales de demo', () => {
    renderLoginForm()
    expect(screen.getByText(/credenciales de demo: demo@vigia\.co \/ vigia2026/i)).toBeInTheDocument()
  })
})
