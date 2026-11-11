import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DURATIONS, formatTime, useFocusTimer } from './useFocusTimer'

const MODES = [
  { mode: 'focus', label: 'Focus' },
  { mode: 'break', label: 'Break' },
]

/** A small Pomodoro timer that lives in the sidebar, so it's visible on every page. */
export function FocusTimer() {
  const timer = useFocusTimer()
  const atStart = !timer.running && timer.remaining === DURATIONS[timer.mode]

  return (
    <div className="rounded-lg border bg-background p-3">
      <div role="group" aria-label="Timer mode" className="flex gap-1">
        {MODES.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            aria-pressed={timer.mode === mode}
            onClick={() => timer.switchMode(mode)}
            className={cn(
              'rounded-md px-2 py-0.5 text-xs font-medium text-muted-foreground hover:text-foreground',
              timer.mode === mode && 'bg-muted text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p
        role="timer"
        aria-label={`${timer.mode === 'focus' ? 'Focus' : 'Break'} time left`}
        className="my-2 text-3xl font-semibold tracking-tight tabular-nums"
      >
        {formatTime(timer.remaining)}
      </p>

      <div className="flex gap-1">
        <Button size="sm" className="flex-1" onClick={timer.running ? timer.pause : timer.start}>
          {timer.running ? <Pause /> : <Play />}
          {timer.running ? 'Pause' : 'Start'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={timer.reset}
          disabled={atStart}
          aria-label="Reset timer"
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  )
}
