import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FocusTimer } from './FocusTimer'

const advance = (ms) => act(() => vi.advanceTimersByTime(ms))
const timeLeft = () => screen.getByRole('timer').textContent

describe('FocusTimer', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })
  afterEach(() => vi.useRealTimers())

  it('counts down, pauses, and resumes', () => {
    render(<FocusTimer />)
    expect(timeLeft()).toBe('25:00')

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    advance(60_000)
    expect(timeLeft()).toBe('24:00')

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }))
    advance(60_000)
    expect(timeLeft()).toBe('24:00')

    fireEvent.click(screen.getByRole('button', { name: 'Reset timer' }))
    expect(timeLeft()).toBe('25:00')
  })

  it('switches to a break when the focus time is up', () => {
    render(<FocusTimer />)
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    advance(25 * 60_000)

    expect(screen.getByRole('button', { name: 'Break' })).toHaveAttribute('aria-pressed', 'true')
    expect(timeLeft()).toBe('5:00')
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })
})
