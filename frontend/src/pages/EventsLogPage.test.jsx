import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EventsLogPage from './EventsLogPage'
import { useEventsToday } from '../hooks/useEventsToday'

vi.mock('../hooks/useEventsToday')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/eventos']}>
      <Routes>
        <Route path="/" element={<div>Dashboard Home</div>} />
        <Route path="/eventos" element={<EventsLogPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

// El hook ya entrega el arreglo ordenado cronológicamente (desc) — la página solo renderiza.
const EVENTS_MOCK = [
  {
    id: 'alert-101',
    type: 'alerta',
    title: 'Comportamiento inusual detectado',
    description: 'Patrón de movimiento errático y aislamiento del rebaño.',
    occurred_at: '2026-08-27T10:45:00Z',
    related_livestock_tag: '#024',
    related_potrero_name: 'Potrero Norte',
    related_alert_id: 101,
  },
  {
    id: 'mission-1',
    type: 'mision',
    title: 'Misión de dron completada',
    description: 'Recorrido de Potrero Norte finalizado.',
    occurred_at: '2026-08-27T10:10:00Z',
    related_livestock_tag: null,
    related_potrero_name: null,
    related_alert_id: null,
  },
]

describe('EventsLogPage', () => {
  beforeEach(() => {
    vi.mocked(useEventsToday).mockReset()
  })

  it('muestra estado de carga mientras loading es true', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: null, loading: true, error: null })
    renderPage()
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('muestra un mensaje de error explícito si eventService rechaza', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: null, loading: false, error: new Error('fail') })
    renderPage()
    expect(screen.getByText(/no se pudieron cargar/i)).toBeInTheDocument()
  })

  it('renderiza la tabla ordenada cronológicamente según el mock', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: EVENTS_MOCK, loading: false, error: null })
    renderPage()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('#024')
    expect(rows[1]).toHaveTextContent('Misión')
  })

  it('un evento sin animal ni potrero relacionado muestra "N/A" sin romper el render', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: EVENTS_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('0 eventos hoy muestra un estado vacío explícito', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: [], loading: false, error: null })
    renderPage()
    expect(screen.getByText('Sin eventos hoy.')).toBeInTheDocument()
  })

  it('click en "Volver" navega a "/"', () => {
    vi.mocked(useEventsToday).mockReturnValue({ data: EVENTS_MOCK, loading: false, error: null })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
  })
})
