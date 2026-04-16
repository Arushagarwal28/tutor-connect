import { useState, useEffect, useRef } from 'react'

/**
 * Counts down from `seconds` to 0.
 * Returns { remaining, isRunning, start, reset }
 */
export default function useOTPTimer(seconds = 59) {
  const [remaining, setRemaining] = useState(seconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = () => {
    setRemaining(seconds)
    setIsRunning(true)
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setRemaining(seconds)
    setIsRunning(false)
  }

  useEffect(() => {
    if (!isRunning) return
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const formatted = `00:${remaining.toString().padStart(2, '0')}`

  return { remaining, formatted, isRunning, start, reset }
}
