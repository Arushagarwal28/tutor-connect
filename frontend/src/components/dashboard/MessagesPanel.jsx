import { useState } from 'react'

/**
 * @param {object[]} conversations  - from STUDENT_CONVERSATIONS or TUTOR_CONVERSATIONS
 */
export default function MessagesPanel({ conversations = [] }) {
  const [activeId,  setActiveId]  = useState(conversations[0]?.id ?? null)
  const [messages,  setMessages]  = useState(() => {
    const map = {}
    conversations.forEach(c => { map[c.id] = [...c.messages] })
    return map
  })
  const [input, setInput] = useState('')

  const active = conversations.find(c => c.id === activeId)
  const activeMessages = messages[activeId] ?? []

  const send = () => {
    if (!input.trim()) return
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    setMessages(prev => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { from: 'me', text: input.trim(), time }],
    }))
    setInput('')
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [activeId]: [...(prev[activeId] ?? []), {
          from: 'them',
          text: "Thanks for your message! I'll get back to you shortly. 😊",
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }],
      }))
    }, 1000)
  }

  return (
    <div className="messages-layout">
      {/* Conversation list */}
      <div className="messages-list">
        <div className="messages-list-header">Conversations</div>
        {conversations.map(c => (
          <div
            key={c.id}
            className={`msg-preview${activeId === c.id ? ' active' : ''}`}
            onClick={() => setActiveId(c.id)}
          >
            <div
              className="msg-preview-avatar"
              style={{ background: c.color, color: c.textColor }}
            >
              {c.initials}
            </div>
            <div className="msg-preview-info">
              <div className="msg-preview-name">{c.name}</div>
              <div className="msg-preview-text">{c.preview}</div>
            </div>
            <div className="msg-preview-time">{c.time}</div>
          </div>
        ))}
      </div>

      {/* Chat pane */}
      <div className="messages-chat">
        {active && (
          <>
            <div className="chat-header">
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: active.color, color: active.textColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0,
              }}>
                {active.initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                  {active.name}
                </div>
                <div style={{ fontSize: 12, color: active.online ? 'var(--green-500)' : 'var(--gray-400)' }}>
                  {active.online ? '● Online' : '● Offline'}
                  {active.subline ? ` · ${active.subline}` : ''}
                </div>
              </div>
            </div>

            <div className="chat-messages">
              {activeMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.from === 'me' ? 'sent' : 'received'}`}>
                  <div className="chat-bubble">{msg.text}</div>
                  <div className="chat-time">{msg.time}</div>
                </div>
              ))}
            </div>

            <div className="chat-input">
              <input
                type="text"
                value={input}
                placeholder="Type a message..."
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button className="btn-primary" style={{ padding: '10px 16px' }} onClick={send}>
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
