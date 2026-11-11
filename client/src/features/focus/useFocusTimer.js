import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const DURATIONS = { focus: 25 * 60_000, break: 5 * 60_000 }

const STORAGE_KEY = 'workflow.focusTimer'
// mode: 'focus' or 'break'
// endsAt: when the timer hits zero (ms timestamp), or null while paused
// remaining: time left while paused (ms)
const initialState = { mode: 'focus', endsAt: null, remaining: DURATIONS.focus }

// Saved in localStorage so a running timer survives reloads and the mobile sidebar closing.
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return saved?.mode in DURATIONS ? saved : initialState
  } catch {
    return initialState
  }
}

/**
 * A Pomodoro timer: 25 minutes of focus, then a 5-minute break.
 *
 * It stores the time the timer *ends at* rather than counting down a number, so
 * it stays accurate even when the browser slows down timers in background tabs.
 */
export function useFocusTimer() {
  const [state, setState] = useState(load)
  const [now, setNow] = useState(Date.now)

  const running = state.endsAt !== null
  const remaining = running ? Math.max(0, state.endsAt - now) : state.remaining

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage can be unavailable (e.g. private browsing); the timer still works.
    }
  }, [state])

  // While running, tick every second. At zero, switch to the other mode, paused.
  useEffect(() => {
    if (state.endsAt === null) return
    const endsAt = state.endsAt
    const id = setInterval(() => {
      if (Date.now() < endsAt) return setNow(Date.now())
      const next = state.mode === 'focus' ? 'break' : 'focus'
      setState({ mode: next, endsAt: null, remaining: DURATIONS[next] })
      toast(
        next === 'break'
          ? 'Focus session done. Take a short break.'
          : 'Break over. Ready to focus?',
      )
    }, 1000)
    return () => clearInterval(id)
  }, [state.endsAt, state.mode])

  return {
    mode: state.mode,
    running,
    remaining,
    start: () => {
      const t = Date.now()
      setNow(t)
      setState((s) => ({ ...s, endsAt: t + s.remaining }))
    },
    pause: () => setState((s) => ({ ...s, endsAt: null, remaining })),
    reset: () => setState((s) => ({ mode: s.mode, endsAt: null, remaining: DURATIONS[s.mode] })),
    switchMode: (mode) => setState({ mode, endsAt: null, remaining: DURATIONS[mode] }),
  }
}

/** 1500000 → "25:00" */
export function formatTime(ms) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
