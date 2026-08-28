import { useEffect, useRef } from 'react'
import ChatMessage from './ChatMessage'
import { BotIcon } from './icons'
import './ChatMessageList.css'

export default function ChatMessageList({ messages, isTyping }) {
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [messages.length, isTyping])

  return (
    <div className="chat-message-list" role="log" aria-live="polite">
      {messages.length === 0 && !isTyping && (
        <p className="chat-message-list__empty">Pregúntale a VIGÍA AI sobre tus animales, alertas o eventos.</p>
      )}
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isTyping && (
        <div className="chat-message chat-message--assistant" aria-label="VIGÍA AI está escribiendo">
          <span className="chat-message__avatar" aria-hidden="true">
            <BotIcon width={15} height={15} />
          </span>
          <div className="chat-message__bubble chat-message-list__typing">
            <span className="chat-message-list__dot" />
            <span className="chat-message-list__dot" />
            <span className="chat-message-list__dot" />
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  )
}
