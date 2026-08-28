import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import LiveFeedPanel from './LiveFeedPanel'

function renderPanel(props) {
  return render(
    <MemoryRouter>
      <LiveFeedPanel {...props} />
    </MemoryRouter>,
  )
}

describe('LiveFeedPanel', () => {
  it('muestra estado de carga mientras loading es true', () => {
    renderPanel({ loading: true, error: null })
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i)
  })

  it('muestra un mensaje de error legible si falla la carga', () => {
    renderPanel({ loading: false, error: new Error('fail') })
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo cargar/i)
  })

  it('muestra el video con badge VIVO y timestamp, con overlays de detección (animal real identificado)', () => {
    renderPanel({
      detections: [
        { livestock_id: 24, livestock_tag: '#024', bbox: { x: 0.42, y: 0.3, width: 0.08, height: 0.1 }, behavior: 'anomalo' },
      ],
      loading: false,
      error: null,
    })
    expect(screen.getByText('VIVO')).toBeInTheDocument()
    expect(screen.getByText('Animal #024 - Comportamiento: Anómalo')).toBeInTheDocument()
  })

  it('limita las cajas mostradas a MAX_BOXES (5) para no verse desordenado', () => {
    const detections = Array.from({ length: 20 }, (_, i) => ({
      livestock_id: i,
      livestock_tag: `#${i}`,
      bbox: { x: 0.1, y: 0.1, width: 0.05, height: 0.05 },
      behavior: 'pastoreo',
    }))
    const { container } = renderPanel({ detections, loading: false, error: null })
    expect(container.querySelectorAll('.detection-overlay__box')).toHaveLength(5)
  })

  it('sin detecciones se muestra sin overlays y sin error', () => {
    renderPanel({ detections: [], loading: false, error: null })
    expect(screen.getByText('VIVO')).toBeInTheDocument()
    expect(screen.queryByText(/Animal /)).not.toBeInTheDocument()
  })

  it('click en "Revisar imágenes capturadas" abre la galería de capturas', () => {
    renderPanel({ loading: false, error: null })
    const button = screen.getByRole('button', { name: /revisar imágenes capturadas/i })
    expect(() => fireEvent.click(button)).not.toThrow()
    expect(screen.getByRole('dialog', { name: /imágenes capturadas/i })).toBeInTheDocument()
  })

  it('sin capturas todavía, la galería muestra el estado vacío', () => {
    renderPanel({ loading: false, error: null })
    fireEvent.click(screen.getByRole('button', { name: /revisar imágenes capturadas/i }))
    expect(screen.getByText(/aún no hay imágenes capturadas/i)).toBeInTheDocument()
  })
})
