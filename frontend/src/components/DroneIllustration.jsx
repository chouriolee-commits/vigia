import droneImg from '../assets/dibujo3d.jpg'
import './DroneIllustration.css'

// specs/013-authentication/design.md — imagen real de fotos-diseño/dibujo3d.png
// (dron sobrevolando y "escaneando" un potrero con ganado), optimizada a JPG para web.
export default function DroneIllustration() {
  return (
    <div className="drone-illustration">
      <img
        className="drone-illustration__img"
        src={droneImg}
        alt="Dron sobrevolando un potrero y escaneando el ganado con visión artificial"
      />
      <div className="drone-illustration__fade" aria-hidden="true" />

      <div className="drone-illustration__rec">
        <span className="drone-illustration__rec-dot" aria-hidden="true" />
        REC
      </div>
    </div>
  )
}
