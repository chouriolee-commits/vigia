import './LoginHero.css'

// Sección de presentación del login — puramente visual, no toca AuthCard ni la lógica de
// autenticación. El fondo de cuadrícula/glow ahora vive en LoginPage (cubre toda la
// pantalla) — este componente solo pone el texto animado palabra por palabra al montar.
const LINE_1 = ['DEL', 'CAMPO', 'AL', 'DATO.']
const LINE_2 = ['DEL', 'DATO', 'A', 'LA', 'DECISIÓN.']

const WORD_STAGGER_MS = 55
const LINE_1_START_MS = 200
const LINE_2_START_MS = 950
const SUBTITLE_START_MS = 1750

function AnimatedLine({ words, startMs, className }) {
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={word + i}
          className={`login-hero__word${i === words.length - 1 ? ' login-hero__word--accent' : ''}`}
          style={{ animationDelay: `${startMs + i * WORD_STAGGER_MS}ms` }}
        >
          {word}
        </span>
      ))}
    </span>
  )
}

export default function LoginHero() {
  return (
    <section className="login-hero">
      <div className="login-hero__content">
        <span className="login-hero__lead-line" aria-hidden="true" />

        <h1 className="login-hero__title">
          <AnimatedLine words={LINE_1} startMs={LINE_1_START_MS} className="login-hero__line" />
          <AnimatedLine words={LINE_2} startMs={LINE_2_START_MS} className="login-hero__line" />
        </h1>

        <p className="login-hero__subtitle" style={{ animationDelay: `${SUBTITLE_START_MS}ms` }}>
          VIGÍA combina visión artificial e inteligencia artificial para transformar el
          monitoreo ganadero en información útil para la toma de decisiones.
        </p>
      </div>
    </section>
  )
}
