import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

/**
 * useSocket
 *
 * Creates and manages a socket.io-client connection tied to the
 * component lifecycle.  The socket is created once (on mount),
 * reconnects automatically, and is cleanly disconnected on unmount.
 *
 * @param {string|null} token  – JWT from useAuth().  Pass null to skip connecting.
 * @returns {{
 *   socketRef: React.MutableRefObject<Socket|null>,
 *   joinRoom:  (roomId: string) => void,
 *   sendMsg:   (payload: object) => void,  
 *   markRead:  (roomId: string) => void,
 * }}
 */
export default function useSocket(token) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return

    // Connect to the same origin so the Vite proxy forwards to :5000
    const socket = io('/', {
      auth: { token },
      // Use WebSocket first, fall back to polling
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id)
    })

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token])

  const joinRoom = useCallback((roomId) => {
    socketRef.current?.emit('join_room', { roomId })
  }, [])

  const sendMsg = useCallback((payload) => {
    socketRef.current?.emit('send_message', payload)
  }, [])

  const markRead = useCallback((roomId) => {
    socketRef.current?.emit('mark_read', { roomId })
  }, [])

  return { socketRef, joinRoom, sendMsg, markRead }
}