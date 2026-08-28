import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from '../hooks/useAuth'
import RegisterForm from './RegisterForm'

function AuthStatus() {
  const { isAuthenticated } = useAuth()
  return <div>{isAuthenticated ? 'autenticado' : 'no autenticado'}</div>
}

function renderRegisterForm() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<RegisterForm />} />
          <Route path="/" element={<AuthStatus />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
}

function fillValidForm(overrides = {}) {
  const values = {
    name: 'Nuevo Productor',
    email: `nuevo-${Date.now()}-${Math.random()}@vigia.co`,
    password: 'clave123',
    confirmPassword: 'clave123',
    ...overrides,
  }

  fireEvent.change(screen.getByLabelText(/^nombre$/i), { target: { value: values.name } })
  fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: values.email } })
  fireEvent.change(screen.getByLabelText(/^contraseña$/i), { target: { value: values.password } })
  fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: values.confirmPassword } })

  return values
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('RegisterForm', () => {
  it('deshabilita el submit si algún campo está vacío', () => {
    renderRegisterForm()
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeDisabled()
  })

  it('muestra error cuando las contraseñas no coinciden, sin navegar', async () => {
    renderRegisterForm()
    fillValidForm({ confirmPassword: 'otra-clave' })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no coinciden/i))
    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue('Nuevo Productor')
  })

  it('con un email nuevo crea la cuenta, autologuea y navega a "/"', async () => {
    renderRegisterForm()
    fillValidForm()
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => expect(screen.getByText('autenticado')).toBeInTheDocument())
  })

  it('con un email ya registrado (credencial demo) muestra error y no navega', async () => {
    renderRegisterForm()
    fillValidForm({ email: 'demo@vigia.co' })
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/ese correo ya está registrado/i))
    expect(screen.queryByText('autenticado')).not.toBeInTheDocument()
  })
})
