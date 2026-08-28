import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import ChatMessage from './ChatMessage'

function renderMessage(message) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<ChatMessage message={message} />} />
        <Route path="/alertas" element={<div>AlertsPage</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ChatMessage', () => {
  it('renderiza un mensaje de usuario', () => {
    renderMessage({ id: 1, role: 'user', content: '¿Qué ocurrió con el animal #024?' })
    expect(screen.getByText('¿Qué ocurrió con el animal #024?')).toBeInTheDocument()
  })

  it('renderiza un mensaje de asistente con acción sugerida que navega a la ruta indicada', () => {
    renderMessage({
      id: 2,
      role: 'assistant',
      content: 'He detectado comportamiento inusual en #024.',
      suggested_action: { label: 'Ver análisis', route: '/alertas' },
    })
    expect(screen.getByText('He detectado comportamiento inusual en #024.')).toBeInTheDocument()
    fireEvent.click(screen.getByText(/ver análisis/i))
    expect(screen.getByText('AlertsPage')).toBeInTheDocument()
  })
})
