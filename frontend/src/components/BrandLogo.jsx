import logoImg from '../assets/vigia-logo.png'
import './BrandLogo.css'

// fotos-diseño/vigia-logo.jpeg — el archivo original traía el fondo como un checkerboard
// (transparencia aplanada al exportar a JPEG, no colores reales); se le quitó el checkerboard
// por color/brillo y se re-exportó como PNG con transparencia real a assets/vigia-logo.png.
// Al ser transparente (ícono verde + texto blanco) se muestra directo sobre el fondo oscuro,
// sin marco — un marco blanco solo hacía falta con el logo anterior, que sí tenía fondo blanco.
export default function BrandLogo({ size = 'sm' }) {
  return (
    <span className={`brand-logo brand-logo--${size}`}>
      <img src={logoImg} alt="VIGÍA" className="brand-logo__img" />
    </span>
  )
}
