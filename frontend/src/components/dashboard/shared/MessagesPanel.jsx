import { apiUrl } from '../../../api.js'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext.jsx'
import useSocket from '../../../hooks/useSocket.js'

// ── helpers ───────────────────────────────────────────────
function buildRoomId(idA, idB) {
  return [String(idA), String(idB)].sort().join('_')
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  })
}

// ── sub-components ────────────────────────────────────────
function Avatar({ initials, bg, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: bg || '#dbeafe', color: color || '#1d4ed8',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35,
    }}>
      {initials}
    </div>
  )
}

function EmptyConversations() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>💬</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-700)', margin: 0 }}>
        No conversations yet
      </p>
      <p style={{ fontSize: 13, color: 'var(--gray-400)', margin: 0, maxWidth: 220 }}>
        Once you connect with a tutor or student, your chats will appear here.
      </p>
    </div>
  )
}

function EmptyChat({ peerName }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <div style={{ fontSize: 36 }}>👋</div>
      <p style={{ fontSize: 14, color: 'var(--gray-400)', margin: 0 }}>
        Say hello to <strong>{peerName}</strong>!
      </p>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--gray-400)', fontSize: 14,
    }}>
      Loading messages…
    </div>
  )
}

// ── Main component ────────────────────────────────────────
export default function MessagesPanel({ title = 'Conversations', initialPeer = null }) {
  const { auth } = useAuth()
  const { socketRef, joinRoom, sendMsg, markRead } = useSocket(auth.token)

  // ── state ─────────────────────────────────────────────
  const [conversations,  setConversations]  = useState([])
  const [convoLoading,   setConvoLoading]   = useState(true)
  const [activeConvo,    setActiveConvo]    = useState(null)
  const [messages,       setMessages]       = useState([])
  const [msgLoading,     setMsgLoading]     = useState(false)
  const [input,          setInput]          = useState('')
  const [sending,        setSending]        = useState(false)
  const [socketError,    setSocketError]    = useState('')

  const chatBottomRef  = useRef(null)
  const chatScrollRef  = useRef(null)   // ref on the scrollable messages container
  const inputRef       = useRef(null)
  const pendingOptIds  = useRef(new Set()) // tracks optimistic message ids awaiting server echo

  const authHeader = useCallback(
    () => ({ Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' }),
    [auth.token]
  )

  // ── helper: build a synthetic convo object ────────────
  const buildSyntheticConvo = useCallback((peer) => {
    const { peerId, peerRole, peerName } = peer
    const initials = (peerName || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const PALETTE  = ['#dbeafe', '#dcfce7', '#f5f3ff', '#fef9c3', '#fee2e2']
    const COLOR_FG = ['#1d4ed8', '#15803d', '#6d28d9', '#92400e', '#b91c1c']
    const idx      = (initials.charCodeAt(0) || 0) % PALETTE.length
    return {
      id:          buildRoomId(auth.user?.id, peerId),
      roomId:      buildRoomId(auth.user?.id, peerId),
      peerId,
      peerRole,
      name:        peerName,
      initials,
      avatarBg:    PALETTE[idx],
      avatarColor: COLOR_FG[idx],
      lastMsg:     '',
      time:        '',
      unreadCount: 0,
    }
  }, [auth.user?.id])


  // ── 1. Fetch conversation list ────────────────────────
  useEffect(() => {
    if (!auth.token) return
    const load = async () => {
      try {
        setConvoLoading(true)
        const res  = await fetch(apiUrl('/api/messages/conversations'), { headers: authHeader() })
        if (!res.ok) throw new Error('Failed to load conversations')
        const data = await res.json()
        setConversations(data)

        if (initialPeer) {
          const roomId   = buildRoomId(auth.user?.id, initialPeer.peerId)
          const existing = data.find(c => c.roomId === roomId)
          setActiveConvo(existing || buildSyntheticConvo(initialPeer))
        } else if (data.length > 0) {
          setActiveConvo(data[0])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setConvoLoading(false)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token])


  // ── 1b. React when initialPeer changes after mount ────
  useEffect(() => {
    if (!initialPeer || !auth.user?.id) return
    const roomId   = buildRoomId(auth.user.id, initialPeer.peerId)
    const existing = conversations.find(c => c.roomId === roomId)
    setActiveConvo(existing || buildSyntheticConvo(initialPeer))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPeer?.peerId])


  // ── 2. Load messages when conversation changes ────────
  useEffect(() => {
    if (!activeConvo) return
    pendingOptIds.current.clear()  // clear optimistic tracking on room switch

    const loadMessages = async () => {
      try {
        setMsgLoading(true)
        setMessages([])
        const res  = await fetch(apiUrl(`/api/messages/${activeConvo.roomId}`), { headers: authHeader() })
        if (!res.ok) throw new Error('Failed to load messages')
        const data = await res.json()
        setMessages(data)
        joinRoom(activeConvo.roomId)
        markRead(activeConvo.roomId)
        setConversations(prev =>
          prev.map(c => c.roomId === activeConvo.roomId ? { ...c, unreadCount: 0 } : c)
        )
      } catch (err) {
        console.error(err)
      } finally {
        setMsgLoading(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
    loadMessages()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvo?.roomId])


  // ── 3. Auto-scroll to bottom only when new messages ───
  // We track the previous message count so we don't hijack
  // the user's scroll position when they're reading history.
  const prevMsgCount = useRef(0)
  useEffect(() => {
    const container = chatScrollRef.current
    if (!container) return

    const newCount = messages.length
    if (newCount === 0) { prevMsgCount.current = 0; return }

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 80

    // Scroll to bottom if: first load, new message arrived, or user is already near bottom
    if (prevMsgCount.current === 0 || newCount > prevMsgCount.current || isAtBottom) {
      chatBottomRef.current?.scrollIntoView({ behavior: prevMsgCount.current === 0 ? 'auto' : 'smooth' })
    }
    prevMsgCount.current = newCount
  }, [messages])


  // ── 4. Socket event listeners ─────────────────────────
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return

    // ── FIX: Duplicate message prevention ───────────────
    // When the sender sends via socket, we already added an optimistic
    // message. The server echoes it back via receive_message.
    // Strategy:
    //   - If the incoming _id matches any real (non-opt) message → skip (already have it)
    //   - If we have a pending optimistic entry → replace it with the real doc
    //   - Otherwise (peer's message) → append normally
    const onReceive = (msg) => {
      if (msg.roomId === activeConvo?.roomId) {
        setMessages(prev => {
          // Already have this exact message by DB _id → ignore echo
          if (prev.some(m => String(m._id) === String(msg._id) && !m.optimistic)) {
            return prev
          }
          // Sender's own echo: replace the most-recent optimistic message
          // that belongs to the current user (FIFO order)
          if (String(msg.senderId) === String(auth.user?.id)) {
            const optIdx = prev.findIndex(m => m.optimistic)
            if (optIdx !== -1) {
              const next = [...prev]
              next[optIdx] = msg           // swap optimistic → real
              pendingOptIds.current.delete(prev[optIdx]._id)
              return next
            }
          }
          // Peer's message or no optimistic found → append
          return [...prev, msg]
        })
        markRead(msg.roomId)
      } else {
        // Increment unread badge for other conversations
        setConversations(prev =>
          prev.map(c =>
            c.roomId === msg.roomId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1, lastMsg: msg.text }
              : c
          )
        )
      }
    }

    const onRead = ({ roomId }) => {
      if (roomId === activeConvo?.roomId) {
        setMessages(prev =>
          prev.map(m =>
            String(m.senderId) === String(auth.user?.id) && !m.readAt
              ? { ...m, readAt: new Date().toISOString() }
              : m
          )
        )
      }
    }

    const onError = ({ message }) => {
      setSocketError(message)
      setTimeout(() => setSocketError(''), 4000)
    }

    socket.on('receive_message', onReceive)
    socket.on('messages_read',   onRead)
    socket.on('error',           onError)

    return () => {
      socket.off('receive_message', onReceive)
      socket.off('messages_read',   onRead)
      socket.off('error',           onError)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketRef.current, activeConvo?.roomId])


  // ── 5. Send a message ─────────────────────────────────
  const handleSend = async () => {
    if (!input.trim() || !activeConvo || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)

    const payload = {
      receiverId:   activeConvo.peerId,
      receiverRole: activeConvo.peerRole,
      text,
    }

    // Optimistic message
    const optId = 'opt_' + Date.now()
    const optimistic = {
      _id:        optId,
      roomId:     activeConvo.roomId,
      senderId:   auth.user?.id,
      senderName: auth.user?.name || 'Me',
      text,
      createdAt:  new Date().toISOString(),
      readAt:     null,
      optimistic: true,
    }
    pendingOptIds.current.add(optId)
    setMessages(prev => [...prev, optimistic])

    try {
      if (socketRef.current?.connected) {
        // Socket path: server persists + echoes back via receive_message.
        // The echo handler above will replace this optimistic entry.
        sendMsg(payload)
      } else {
        // REST fallback
        const res  = await fetch(apiUrl('/api/messages/send'), {
          method: 'POST', headers: authHeader(),
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error('REST send failed')
        const saved = await res.json()
        // Replace optimistic with the saved doc
        setMessages(prev =>
          prev.map(m => m._id === optId ? saved : m)
        )
        pendingOptIds.current.delete(optId)
      }

      // Update conversation sidebar preview
      setConversations(prev => {
        const exists  = prev.some(c => c.roomId === activeConvo.roomId)
        const preview = text.length > 40 ? text.slice(0, 40) + '…' : text
        if (exists) {
          return prev.map(c =>
            c.roomId === activeConvo.roomId ? { ...c, lastMsg: preview } : c
          )
        }
        return [{ ...activeConvo, lastMsg: preview }, ...prev]
      })
    } catch (err) {
      console.error('Send error:', err)
      setMessages(prev => prev.filter(m => m._id !== optId))
      pendingOptIds.current.delete(optId)
      setSocketError('Message failed to send. Please try again.')
      setTimeout(() => setSocketError(''), 4000)
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }


  // ── render ────────────────────────────────────────────
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)' }}>Messages</h2>
      </div>

      {socketError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
          padding: '10px 16px', marginBottom: 12, fontSize: 13, color: '#dc2626',
        }}>
          ⚠️ {socketError}
        </div>
      )}

      <div className="messages-layout">

        {/* ── Left: conversation list ─────────────────── */}
        <div className="messages-list">
          <div className="messages-list-header">{title}</div>

          {convoLoading ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--gray-400)' }}>Loading…</div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 20, fontSize: 13, color: 'var(--gray-400)', textAlign: 'center' }}>
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.roomId}
                className={`msg-preview${conv.roomId === activeConvo?.roomId ? ' active' : ''}`}
                onClick={() => setActiveConvo(conv)}
              >
                <Avatar initials={conv.initials} bg={conv.avatarBg} color={conv.avatarColor} />
                <div className="msg-preview-info">
                  <div className="msg-preview-name">{conv.name}</div>
                  <div className="msg-preview-text">{conv.lastMsg || 'No messages yet'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <div className="msg-preview-time">{conv.time}</div>
                  {conv.unreadCount > 0 && (
                    <div style={{
                      background: 'var(--blue-600)', color: 'white',
                      borderRadius: '100px', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', minWidth: 18, textAlign: 'center',
                    }}>
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Right: chat window ──────────────────────── */}
        <div className="messages-chat">

          {!activeConvo ? (
            <EmptyConversations />
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <Avatar initials={activeConvo.initials} bg={activeConvo.avatarBg} color={activeConvo.avatarColor} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)' }}>
                    {activeConvo.name}
                  </div>
                  <div style={{ fontSize: 12, color: socketRef.current?.connected ? 'var(--green-500)' : 'var(--gray-400)' }}>
                    {socketRef.current?.connected ? '● Online' : '○ Connecting…'}
                  </div>
                </div>
              </div>

              {/* ── Messages — scrollable container ──────
                  FIX: explicit overflow-y:auto + max-height so old
                  messages are reachable by scrolling up.            */}
              <div
                ref={chatScrollRef}
                className="chat-messages"
                style={{
                  overflowY:    'auto',
                  flex:         '1 1 0',
                  minHeight:    0,
                  maxHeight:    '100%',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--gray-300) transparent',
                }}
              >
                {msgLoading ? (
                  <LoadingSpinner />
                ) : messages.length === 0 ? (
                  <EmptyChat peerName={activeConvo.name} />
                ) : (
                  messages.map((msg) => {
                    const isMine = String(msg.senderId) === String(auth.user?.id)
                    return (
                      <div
                        key={msg._id}
                        className={`chat-message ${isMine ? 'sent' : 'received'}`}
                        style={{ opacity: msg.optimistic ? 0.7 : 1 }}
                      >
                        {!isMine && (
                          <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 2 }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div className="chat-bubble">{msg.text}</div>
                        <div className="chat-time" style={{ display: 'flex', gap: 4, justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                          {formatTime(msg.createdAt)}
                          {isMine && (
                            <span style={{ color: msg.readAt ? 'var(--blue-400)' : 'var(--gray-400)' }}>
                              {msg.readAt ? ' ✓✓' : ' ✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input */}
              <div className="chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={sending ? 'Sending…' : 'Type a message… (Enter to send)'}
                  disabled={sending}
                  maxLength={2000}
                />
                <button
                  className="btn-primary"
                  style={{ padding: '10px 16px', opacity: (!input.trim() || sending) ? 0.6 : 1 }}
                  onClick={handleSend}
                  disabled={!input.trim() || sending}
                >
                  {sending ? '…' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}