import { useState } from 'react'
import { SendIcon } from './icons'
import './ChatInput.css'

// specs/007-ai-assistant: botón enviar deshabilitado con input vacío (caso límite obligatorio).
export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const canSend = value.trim().length > 0 && !disabled

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSend) return
    onSend(value)
    setValue('')
  }

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input__field"
        placeholder="Escribe tu pregunta..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Escribe tu pregunta para VIGÍA AI"
      />
      <button type="submit" className="chat-input__submit" disabled={!canSend} aria-label="Enviar mensaje">
        <SendIcon width={18} height={18} />
      </button>
    </form>
  )
}
