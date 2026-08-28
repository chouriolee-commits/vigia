import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from './icons'
import './BackButton.css'

// specs/002-dashboard/design.md — contrato de navegación: siempre vuelve a "/".
export default function BackButton() {
  const navigate = useNavigate()
  return (
    <button type="button" className="back-button" onClick={() => navigate('/')}>
      <ArrowLeftIcon width={16} height={16} />
      Volver
    </button>
  )
}
