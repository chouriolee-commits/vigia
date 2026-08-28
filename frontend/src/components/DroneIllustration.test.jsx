import { render, screen } from '@testing-library/react'
import DroneIllustration from './DroneIllustration'

describe('DroneIllustration', () => {
  it('renderiza la escena con el indicador REC', () => {
    render(<DroneIllustration />)
    expect(screen.getByRole('img', { name: /dron/i })).toBeInTheDocument()
    expect(screen.getByText('REC')).toBeInTheDocument()
  })
})
