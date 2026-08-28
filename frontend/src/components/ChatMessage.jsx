import { useNavigate } from 'react-router-dom'
import { BotIcon, UserIcon } from './icons'
import './ChatMessage.css'

// specs/007-ai-assistant/design.md — avatares distintos por rol; `suggested_action.route`
// solo apunta a una de las 4 rutas ya existentes (contrato de navegación).
export default function ChatMessage({ message }) {
  const navigate = useNavigate()
  const isUser = message.role === 'user'
  const Icon = isUser ? UserIcon : BotIcon

  return (
    <div className={`chat-message chat-message--${isUser ? 'user' : 'assistant'}`}>
      <span className="chat-message__avatar" aria-hidden="true">
        <Icon width={15} height={15} />
      </span>
      <div className="chat-message__bubble">
        <p className="chat-message__text">{message.content}</p>
        {message.suggested_action && (
          <button type="button" className="chat-message__action" onClick={() => navigate(message.suggested_action.route)}>
            {message.suggested_action.label} →
          </button>
        )}
      </div>
    </div>
  )
}
