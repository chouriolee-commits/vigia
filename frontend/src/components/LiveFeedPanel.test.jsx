import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LiveFeedPanel from './LiveFeedPanel'
import { useLiveFeed } from '../hooks/useLiveFeed'

vi.mock('../hooks/useLiveFeed')

const NOW = new Date('2026-08-27T10:45:32Z')

function renderPanel() {
  return render(
    <MemoryRouter>
      <LiveFeedPanel />
    </MemoryRouter>,
  )
}

describe('LiveFeedPanel', () => {
  beforeEach(() => {
    vi.mocked(useLiveFeed).mockReset()
  })

  it('muestra estado de carga mientras loading es true', () => {
    vi.mocked(useLiveFeed).mockReturnValue({ frame: null, now: NOW, loading: true, error: null })
    renderPanel()
    expect(screen.getByRole('status')).toHaveTextContent(/cargando/i)
  })

  it('muestra un mensaje de error legible si el hook falla', () => {
    vi.mocked(useLiveFeed).mockReturnValue({ frame: null, now: NOW, loading: false, error: new Error('fail') })
    renderPanel()
    expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo cargar/i)
  })

  it('renderiza overlays de detección según el mock, con badge VIVO y timestamp', () => {
    vi.mocked(useLiveFeed).mockReturnValue({
      frame: {
        potreroName: 'Potrero Norte',
        detections: [
          { livestock_id: 24, livestock_tag: '#024', bbox: { x: 0.42, y: 0.3, width: 0.08, height: 0.1 }, behavior: 'anomalo', confidence: 0.94 },
        ],
      },
      now: NOW,
      loading: false,
      error: null,
    })
    renderPanel()
    expect(screen.getByText('VIVO')).toBeInTheDocument()
    expect(screen.getByText('Animal #024 - Comportamiento: Anómalo')).toBeInTheDocument()
  })

  it('frame sin detecciones se muestra sin overlays y sin error', () => {
    vi.mocked(useLiveFeed).mockReturnValue({
      frame: { potreroName: 'Potrero Norte', detections: [] },
      now: NOW,
      loading: false,
      error: null,
    })
    renderPanel()
    expect(screen.getByText('VIVO')).toBeInTheDocument()
    expect(screen.queryByText(/Animal #/)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('click en "Revisar imágenes capturadas" no navega ni produce error', () => {
    vi.mocked(useLiveFeed).mockReturnValue({
      frame: { potreroName: 'Potrero Norte', detections: [] },
      now: NOW,
      loading: false,
      error: null,
    })
    renderPanel()
    const button = screen.getByRole('button', { name: /revisar imágenes capturadas/i })
    expect(() => fireEvent.click(button)).not.toThrow()
    expect(button).toHaveAttribute('aria-disabled', 'true')
    expect(button).not.toHaveAttribute('disabled')
  })
})
