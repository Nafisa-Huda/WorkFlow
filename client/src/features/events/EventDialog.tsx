import { addHours, format, startOfHour } from 'date-fns'
import { Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CalendarEvent } from '@/lib/types'
import { useDetailParams } from '@/lib/useDetailParams'
import { useCreateEvent, useDeleteEvent, useEvent, useUpdateEvent } from './api'

/** Create/edit dialog for events, opened from anywhere via ?event=new or ?event=<id>. */
export function EventDialog() {
  const { eventId, eventStart, closeEvent } = useDetailParams()
  const isNew = eventId === 'new'
  const { data: event, isError } = useEvent(isNew ? null : eventId)

  useEffect(() => {
    if (isError) closeEvent()
  }, [isError, closeEvent])

  const ready = isNew || !!event
  return (
    <Dialog open={!!eventId} onOpenChange={(open) => !open && closeEvent()}>
      <DialogContent className="sm:max-w-md">
        {ready && (
          <EventForm
            key={eventId}
            event={event}
            defaultStart={eventStart ? new Date(eventStart) : undefined}
            onDone={closeEvent}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EventForm({
  event,
  defaultStart,
  onDone,
}: {
  event?: CalendarEvent
  defaultStart?: Date
  onDone: () => void
}) {
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  const initialStart = event
    ? new Date(event.start)
    : (defaultStart ?? startOfHour(addHours(new Date(), 1)))
  const initialEnd = event ? new Date(event.end) : addHours(initialStart, 1)

  const [title, setTitle] = useState(event?.title ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [date, setDate] = useState(format(initialStart, 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState(format(initialStart, 'HH:mm'))
  const [endTime, setEndTime] = useState(format(initialEnd, 'HH:mm'))
  const [error, setError] = useState<string | null>(null)

  const saving = createEvent.isPending || updateEvent.isPending

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // "2026-11-03T14:00" (no offset) parses as local time.
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    if (!title.trim()) return setError('Give the event a title.')
    if (end <= start) return setError('End time must be after the start time.')

    const input = { title: title.trim(), notes, start: start.toISOString(), end: end.toISOString() }
    const options = { onSuccess: onDone }
    if (event) updateEvent.mutate({ id: event.id, changes: input }, options)
    else createEvent.mutate(input, options)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <DialogHeader>
        <DialogTitle>{event ? 'Edit event' : 'New event'}</DialogTitle>
        <DialogDescription>Events show on your agenda next to scheduled tasks.</DialogDescription>
      </DialogHeader>

      <FieldGroup className="py-4">
        <Field data-invalid={!!error && !title.trim()}>
          <FieldLabel htmlFor="event-title">Title</FieldLabel>
          <Input
            id="event-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-[1fr_auto_auto] gap-2">
          <Field>
            <FieldLabel htmlFor="event-date">Date</FieldLabel>
            <Input
              id="event-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event-start">Start</FieldLabel>
            <Input
              id="event-start"
              type="time"
              required
              step={900}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="event-end">End</FieldLabel>
            <Input
              id="event-end"
              type="time"
              required
              step={900}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="event-notes">Notes</FieldLabel>
          <Textarea
            id="event-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={5000}
          />
        </Field>
        <FieldError role="alert">{error}</FieldError>
      </FieldGroup>

      <DialogFooter className="sm:justify-between">
        {event ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => deleteEvent.mutate(event.id, { onSuccess: onDone })}
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <Button type="submit" disabled={saving}>
          {event ? 'Save changes' : 'Add event'}
        </Button>
      </DialogFooter>
    </form>
  )
}
