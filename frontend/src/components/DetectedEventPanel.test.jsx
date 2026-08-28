import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import DetectedEventPanel from './DetectedEventPanel'

const EVENTO = {
  livestock_id: 24,
  livestock_tag: '#024',
  titulo: 'Atención requerida',
  descripcion: 'Comportamiento inusual detectado: Patrón de movimiento errático.',
  confidence: 0.94,
  alert_id: 101,
}

function renderPanel(eventoDetectado) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<DetectedEventPanel eventoDetectado={eventoDetectado} />} />
        <Route path="/alertas" element={<div>AlertsPage</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DetectedEventPanel', () => {
  it('muestra el evento del mock (animal, descripción, confidence)', () => {
    renderPanel(EVENTO)
    expect(screen.getByText('Atención requerida')).toBeInTheDocument()
    expect(screen.getByText('Animal #024')).toBeInTheDocument()
    expect(screen.getByText(EVENTO.descripcion)).toBeInTheDocument()
    expect(screen.getByText('94%')).toBeInTheDocument()
  })

  it('click en "Ver análisis →" navega a /alertas (no crea una pantalla nueva)', () => {
    renderPanel(EVENTO)
    fireEvent.click(screen.getByText(/ver análisis/i))
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })

  it('evento_detectado null muestra estado vacío en vez de romper', () => {
    renderPanel(null)
    expect(screen.getByText('Sin eventos recientes')).toBeInTheDocument()
    expect(screen.queryByText(/ver análisis/i)).not.toBeInTheDocument()
  })
})
