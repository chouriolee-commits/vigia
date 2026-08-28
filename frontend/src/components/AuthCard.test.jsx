import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from '../hooks/useAuth'
import AuthCard from './AuthCard'

function LocationProbe() {
  const location = useLocation()
  return <span data-testid="pathname">{location.pathname}</span>
}

function renderAuthCard() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <LocationProbe />
        <AuthCard />
      </AuthProvider>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('AuthCard', () => {
  it('alterna entre LoginForm y RegisterForm sin desmontar la ilustración ni cambiar de ruta', () => {
    renderAuthCard()

    const illustration = screen.getByRole('img', { name: /dron/i })
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByTestId('pathname')).toHaveTextContent('/login')

    fireEvent.click(screen.getByText(/regístrate/i))

    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /dron/i })).toBe(illustration)
    expect(screen.getByTestId('pathname')).toHaveTextContent('/login')

    fireEvent.click(screen.getByText(/inicia sesión/i))

    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /dron/i })).toBe(illustration)
  })
})
