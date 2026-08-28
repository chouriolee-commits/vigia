import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AlertsPage from './AlertsPage'
import { useAlerts } from '../hooks/useAlerts'

vi.mock('../hooks/useAlerts')

// Simula el dashboard real: solo muestra el alertaFoco recibido por navigate(state)
// para poder verificar qué llegó, sin montar DashboardPage completo.
function DashboardHomeStub() {
  const { state } = useLocation()
  return (
    <div>
      Dashboard Home
      {state?.alertaFoco && <p>alertaFoco: {JSON.stringify(state.alertaFoco)}</p>}
    </div>
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/alertas']}>
      <Routes>
        <Route path="/" element={<DashboardHomeStub />} />
        <Route path="/alertas" element={<AlertsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// El hook ya entrega el arreglo ordenado (prioridad desc, fecha desc) — la página solo renderiza.
const ALERTS_MOCK = [
  {
    id: 101,
    livestock_id: 24,
    livestock_tag: '#024',
    potrero_id: 1,
    potrero_name: 'Potrero Norte',
    type: 'comportamiento_anomalo',
    priority: 'alta',
    status: 'activa',
    title: 'Comportamiento inusual detectado',
    description: 'Patrón de movimiento errático y aislamiento del rebaño.',
    confidence: 0.94,
    created_at: '2026-08-27T10:45:00Z',
    resolved_at: null,
  },
  {
    id: 103,
    livestock_id: null,
    livestock_tag: null,
    potrero_id: 1,
    potrero_name: 'Potrero Norte',
    type: 'animal_desconocido',
    priority: 'baja',
    status: 'en_revision',
    title: 'Detección sin identificar',
    description: 'Se detectó un animal que no coincide con el listado registrado.',
    confidence: 0.68,
    created_at: '2026-08-27T10:15:00Z',
    resolved_at: null,
  },
]

describe('AlertsPage', () => {
  beforeEach(() => {
    vi.mocked(useAlerts).mockReset()
  })

  it('muestra estado de carga mientras loading es true', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: null, loading: true, error: null })
    renderPage()
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('muestra un mensaje de error explícito si alertService rechaza', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: null, loading: false, error: new Error('fail') })
    renderPage()
    expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('renderiza la tabla con las alertas del mock en el orden entregado (prioridad/fecha)', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: ALERTS_MOCK, loading: false, error: null })
    renderPage()
    const rows = screen.getAllByRole('row').slice(1) // sin header
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('#024')
    expect(rows[0]).toHaveTextContent('Alta')
    expect(rows[1]).toHaveTextContent('Baja')
  })

  it('una alerta con livestock_id:null muestra "N/A" en la columna Animal sin romper el render', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: ALERTS_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('0 alertas muestra un estado vacío explícito', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: [], loading: false, error: null })
    renderPage()
    expect(screen.getByText('No hay alertas activas.')).toBeInTheDocument()
  })

  it('click en una fila manda al asistente con la ficha completa de la alerta', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: ALERTS_MOCK, loading: false, error: null })
    renderPage()
    const rows = screen.getAllByRole('row').slice(1)
    fireEvent.click(rows[0])
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
    const ficha = JSON.parse(screen.getByText(/alertaFoco:/).textContent.replace('alertaFoco: ', ''))
    expect(ficha).toMatchObject({
      livestock_tag: '#024',
      potrero_name: 'Potrero Norte',
      type: 'comportamiento_anomalo',
      priority: 'alta',
      status: 'activa',
      title: 'Comportamiento inusual detectado',
      description: 'Patrón de movimiento errático y aislamiento del rebaño.',
    })
  })

  it('click en una alerta sin animal asociado (livestock_id null) igual navega con su ficha', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: ALERTS_MOCK, loading: false, error: null })
    renderPage()
    const rows = screen.getAllByRole('row').slice(1)
    fireEvent.click(rows[1])
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
    const ficha = JSON.parse(screen.getByText(/alertaFoco:/).textContent.replace('alertaFoco: ', ''))
    expect(ficha.livestock_tag).toBeNull()
    expect(ficha.title).toBe('Detección sin identificar')
  })

  it('click en "Volver" navega a "/"', () => {
    vi.mocked(useAlerts).mockReturnValue({ data: ALERTS_MOCK, loading: false, error: null })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
  })
})
