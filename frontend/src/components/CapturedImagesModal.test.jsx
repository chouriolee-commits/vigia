import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CapturedImagesModal from './CapturedImagesModal'

const CAPTURES = [
  { id: 2, dataUrl: 'data:image/jpeg;base64,AAA', capturedAt: new Date('2026-08-28T10:45:32Z') },
  { id: 1, dataUrl: 'data:image/jpeg;base64,BBB', capturedAt: new Date('2026-08-28T10:45:20Z') },
]

describe('CapturedImagesModal', () => {
  it('no renderiza nada si open es false', () => {
    const { container } = render(<CapturedImagesModal open={false} captures={[]} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('muestra el estado vacío cuando no hay capturas', () => {
    render(<CapturedImagesModal open captures={[]} onClose={vi.fn()} />)
    expect(screen.getByText(/aún no hay imágenes capturadas/i)).toBeInTheDocument()
  })

  it('renderiza una miniatura por cada captura, con su timestamp', () => {
    render(<CapturedImagesModal open captures={CAPTURES} onClose={vi.fn()} />)
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAttribute('src', CAPTURES[0].dataUrl)
  })

  it('llama a onClose al hacer click en el botón de cerrar', () => {
    const onClose = vi.fn()
    render(<CapturedImagesModal open captures={[]} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('llama a onClose al hacer click en el backdrop, pero no al hacer click dentro del modal', () => {
    const onClose = vi.fn()
    render(<CapturedImagesModal open captures={[]} onClose={onClose} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('dialog').parentElement)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('llama a onClose al presionar Escape', () => {
    const onClose = vi.fn()
    render(<CapturedImagesModal open captures={[]} onClose={onClose} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
  })
})
