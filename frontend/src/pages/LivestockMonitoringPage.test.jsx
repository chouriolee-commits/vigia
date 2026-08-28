import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LivestockMonitoringPage from './LivestockMonitoringPage'
import { useLivestockReconciliation } from '../hooks/useLivestockReconciliation'

vi.mock('../hooks/useLivestockReconciliation')

// Simula el dashboard real: solo muestra el animalFoco recibido por navigate(state)
// para poder verificar qué llegó, sin montar DashboardPage completo.
function DashboardHomeStub() {
  const { state } = useLocation()
  return (
    <div>
      Dashboard Home
      {state?.animalFoco && <p>animalFoco: {JSON.stringify(state.animalFoco)}</p>}
    </div>
  )
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/animales']}>
      <Routes>
        <Route path="/" element={<DashboardHomeStub />} />
        <Route path="/animales" element={<LivestockMonitoringPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

const RECONCILIATION_MOCK = {
  potrero: { id: 1, name: 'Potrero Norte' },
  ventana_horas: 2,
  cantidad_escaneada: 12,
  animales_reales: [
    {
      livestock_id: 24,
      livestock_tag: '#024',
      alias: null,
      detected_at: '2026-08-27T10:45:00Z',
      behavior: 'anomalo',
      confidence: 0.94,
      es_esperado_aqui: true,
    },
    {
      livestock_id: null,
      livestock_tag: null,
      alias: 'Animal no identificado',
      detected_at: '2026-08-27T10:40:00Z',
      behavior: 'pastoreo',
      confidence: 0.71,
      es_esperado_aqui: false,
    },
  ],
  animales_esperados: [
    { livestock_id: 24, livestock_tag: '#024', species: 'bovino', breed: 'Holstein', status: 'activo', detectado_recientemente: true },
    { livestock_id: 30, livestock_tag: '#030', species: 'bovino', breed: 'Angus', status: 'activo', detectado_recientemente: false },
  ],
}

describe('LivestockMonitoringPage', () => {
  beforeEach(() => {
    vi.mocked(useLivestockReconciliation).mockReset()
  })

  it('muestra estado de carga mientras loading es true', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: null, loading: true, error: null })
    renderPage()
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('muestra un mensaje de error explícito si el hook falla (no pantalla en blanco)', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: null, loading: false, error: new Error('fail') })
    renderPage()
    expect(screen.getByText(/no se pudo cargar/i)).toBeInTheDocument()
  })

  it('renderiza ambas tablas (real y esperado) con los datos del mock', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('En el potrero (real)')).toBeInTheDocument()
    expect(screen.getByText('Deberían estar (esperado)')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Potrero Norte/ })).toBeInTheDocument()
    expect(screen.getAllByText('#024')).toHaveLength(2) // una fila en cada tabla
  })

  it('muestra el total de animales registrados junto al nombre del potrero', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('2 animales')).toBeInTheDocument()
  })

  it('muestra la cantidad escaneada en el último escaneo del potrero', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('12 escaneados')).toBeInTheDocument()
  })

  it('un animal esperado con detectado_recientemente:false se muestra como Faltante', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('Faltante')).toBeInTheDocument()
    expect(screen.getByText('#030')).toBeInTheDocument()
  })

  it('una detección con es_esperado_aqui:false se muestra como "Animal no identificado" y Fuera de potrero', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    expect(screen.getByText('Animal no identificado')).toBeInTheDocument()
    expect(screen.getByText('Fuera de potrero')).toBeInTheDocument()
  })

  it('click en una fila de "En el potrero (real)" manda al asistente con la ficha completa del animal', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    // '#024' aparece en ambas tablas -- el primero en el DOM es el de "En el potrero (real)".
    fireEvent.click(screen.getAllByText('#024')[0])
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
    const ficha = JSON.parse(screen.getByText(/animalFoco:/).textContent.replace('animalFoco: ', ''))
    expect(ficha).toMatchObject({
      livestock_id: 24,
      livestock_tag: '#024',
      species: 'bovino',
      breed: 'Holstein',
      status: 'activo',
      potrero: 'Potrero Norte',
      comportamiento: 'anomalo',
    })
  })

  it('click en una detección sin identificar (livestock_id null) no navega a ningún lado', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    fireEvent.click(screen.getByText('Animal no identificado'))
    expect(screen.queryByText('Dashboard Home')).not.toBeInTheDocument()
  })

  it('click en "Volver" navega a "/"', () => {
    vi.mocked(useLivestockReconciliation).mockReturnValue({ data: RECONCILIATION_MOCK, loading: false, error: null })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /volver/i }))
    expect(screen.getByText('Dashboard Home')).toBeInTheDocument()
  })
})
