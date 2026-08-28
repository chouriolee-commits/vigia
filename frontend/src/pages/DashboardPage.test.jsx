import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './DashboardPage'
import { useDashboardData } from '../hooks/useDashboardData'

vi.mock('../hooks/useDashboardData')

const DASHBOARD_MOCK = {
  animales_monitoreados: { total: 24, actualizado_at: '2026-08-27T10:45:00Z' },
  alertas_activas: [
    {
      id: 101,
      livestock_tag: '#024',
      type: 'comportamiento_anomalo',
      priority: 'alta',
      status: 'activa',
      description: 'Patrón de movimiento errático y aislamiento del rebaño.',
      confidence: 0.94,
      created_at: '2026-08-27T10:45:00Z',
    },
  ],
  eventos_hoy: { total: 5 },
  evento_detectado: {
    livestock_id: 24,
    livestock_tag: '#024',
    titulo: 'Atención requerida',
    descripcion: 'Comportamiento inusual detectado...',
    confidence: 0.94,
    alert_id: 101,
  },
  feed_detecciones: [
    { livestock_id: 24, livestock_tag: '#024', bbox: { x: 0.42, y: 0.3, width: 0.08, height: 0.1 }, behavior: 'anomalo', confidence: 0.94 },
  ],
}

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/animales" element={<div>LivestockPage</div>} />
        <Route path="/alertas" element={<div>AlertsPage</div>} />
        <Route path="/eventos" element={<div>EventsPage</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useDashboardData).mockReset()
  })

  it('muestra estado de carga mientras loading es true (no pantalla en blanco)', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: null, loading: true, error: null })
    renderDashboard()
    expect(screen.getAllByText(/cargando/i).length).toBeGreaterThan(0)
  })

  it('muestra un mensaje de error legible si el hook falla', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: null, loading: false, error: new Error('fail') })
    renderDashboard()
    expect(screen.getAllByText(/no se pudo cargar/i).length).toBeGreaterThan(0)
  })

  it('renderiza las 3 KPI cards con los valores del mock', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    expect(screen.getByText('Animales Monitoreados')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('1 prioridad alta')).toBeInTheDocument()
    expect(screen.getByText('Eventos Hoy')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('click en "Animales Monitoreados" navega a /animales', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    fireEvent.click(screen.getByText('Animales Monitoreados'))
    expect(screen.getByText('LivestockPage')).toBeInTheDocument()
  })

  it('click en "Alertas Activas" navega a /alertas', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    fireEvent.click(screen.getByText('Alertas Activas'))
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })

  it('click en "Eventos Hoy" navega a /eventos', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    fireEvent.click(screen.getByText('Eventos Hoy'))
    expect(screen.getByText('EventsPage')).toBeInTheDocument()
  })

  it('click en "Ver análisis →" navega a /alertas (reutiliza la pantalla, no crea una nueva)', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    // el link del panel "Evento detectado" (el chat también puede ofrecer una acción con el mismo texto).
    fireEvent.click(screen.getByRole('link', { name: /ver análisis/i }))
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })

  it('click en "Revisar imágenes capturadas" no navega (sin ruta en el MVP)', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    fireEvent.click(screen.getByRole('button', { name: /revisar imágenes capturadas/i }))
    expect(screen.getByText('Animales Monitoreados')).toBeInTheDocument()
  })

  it('DetectedEventPanel muestra el evento del mock (animal, descripción, confidence)', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    expect(screen.getByText('Animal #024')).toBeInTheDocument()
    expect(screen.getByText('Comportamiento inusual detectado...')).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
  })

  it('alertas_activas vacío: la card muestra 0, sin sublabel de prioridad alta, y sigue siendo clicable', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: { ...DASHBOARD_MOCK, alertas_activas: [], evento_detectado: null },
      loading: false,
      error: null,
    })
    renderDashboard()
    expect(screen.getByText('Alertas Activas')).toBeInTheDocument()
    expect(screen.queryByText(/prioridad alta/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Alertas Activas'))
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })

  it('evento_detectado null: el panel muestra estado vacío en vez de un evento roto', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: { ...DASHBOARD_MOCK, evento_detectado: null },
      loading: false,
      error: null,
    })
    renderDashboard()
    expect(screen.getByText('Sin eventos recientes')).toBeInTheDocument()
  })

  it('el feed muestra los bounding boxes reales de feed_detecciones (vision/simulator.py con animales identificados)', () => {
    vi.mocked(useDashboardData).mockReturnValue({ data: DASHBOARD_MOCK, loading: false, error: null })
    renderDashboard()
    expect(screen.getByText('Animal #024 - Comportamiento: Anómalo')).toBeInTheDocument()
  })

  it('feed_detecciones vacío: el feed se muestra sin overlays y sin error', () => {
    vi.mocked(useDashboardData).mockReturnValue({
      data: { ...DASHBOARD_MOCK, feed_detecciones: [] },
      loading: false,
      error: null,
    })
    renderDashboard()
    // "Animal #024" sigue existiendo en el panel de evento detectado (dato distinto al feed);
    // lo que valida este caso es que el feed no muestre la etiqueta "Comportamiento: ..." de una detección.
    expect(screen.queryByText(/Comportamiento:/)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
