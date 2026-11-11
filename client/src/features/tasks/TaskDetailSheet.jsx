import { addMinutes, differenceInMinutes, format, parseISO } from 'date-fns'
import { Loader2, Trash2, X } from 'lucide-react'
import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useLists } from '@/features/lists/api'
import { todayKey } from '@/lib/dates'
import { useOpenTask } from '@/features/tasks/useOpenTask'
import { useDeleteTask, useTask, useUpdateTask } from './api'
import { ListSelect, PrioritySelect } from './TaskFields'

/**
 * Side panel for editing a task, opened from anywhere via ?task=<id>.
 * Changes save as you go: no Save button.
 */
export function TaskDetailSheet() {
  const { taskId, closeTask } = useOpenTask()
  const { data: task, isError } = useTask(taskId)

  // A stale or foreign link (deleted task, someone else's id): just close.
  useEffect(() => {
    if (isError) closeTask()
  }, [isError, closeTask])

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && closeTask()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {task ? (
          // Keyed so local form state resets when a different task is opened.
          <TaskDetailForm key={task.id} task={task} onClose={closeTask} />
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Task details</SheetTitle>
              <SheetDescription>Loading…</SheetDescription>
            </SheetHeader>
            <Loader2 className="m-auto size-5 animate-spin text-muted-foreground" />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function TaskDetailForm({ task, onClose }) {
  const { data: lists = [] } = useLists()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)
  const deleted = useRef(false)

  const save = (changes) => updateTask.mutate({ id: task.id, changes })

  const saveTitle = () => {
    const trimmed = title.trim()
    if (!trimmed) return setTitle(task.title) // a task can't have an empty title
    if (trimmed !== task.title) save({ title: trimmed })
  }
  const saveNotes = () => notes !== task.notes && save({ notes })

  // Closing the sheet (Esc, overlay click) unmounts the inputs without a blur event,
  // so flush any unsaved text on unmount too.
  const flushDrafts = useEffectEvent(() => {
    if (deleted.current) return
    saveTitle()
    saveNotes()
  })
  useEffect(() => () => flushDrafts(), [])

  return (
    <>
      <SheetHeader className="border-b">
        <SheetTitle>Task details</SheetTitle>
        <SheetDescription>Changes are saved automatically.</SheetDescription>
      </SheetHeader>

      <FieldGroup className="flex-1 overflow-y-auto p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={!!task.completedAt}
            onCheckedChange={(checked) => save({ completed: checked === true })}
            aria-label={task.completedAt ? 'Mark as not done' : 'Mark as done'}
            className="mt-2.5 size-[18px] rounded-full"
          />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label="Title"
            maxLength={200}
            className="h-auto border-0 px-0 py-1.5 text-lg font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </div>

        <Field>
          <FieldLabel htmlFor="task-notes">Notes</FieldLabel>
          <Textarea
            id="task-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={saveNotes}
            placeholder="Add details, links, or next steps"
            rows={5}
            maxLength={5000}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="task-due">Due date</FieldLabel>
          <div className="flex gap-2">
            <Input
              id="task-due"
              type="date"
              value={task.dueDate ?? ''}
              onChange={(e) => save({ dueDate: e.target.value || null })}
              className="w-auto"
            />
            {task.dueDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => save({ dueDate: null })}
                aria-label="Clear due date"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </Field>

        <ScheduleField task={task} onChange={save} />

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="task-priority">Priority</FieldLabel>
            <PrioritySelect
              id="task-priority"
              value={task.priority}
              onChange={(priority) => save({ priority })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="task-list">List</FieldLabel>
            <ListSelect
              id="task-list"
              lists={lists}
              value={task.listId}
              onChange={(listId) => save({ listId })}
            />
          </Field>
        </div>
      </FieldGroup>

      <SheetFooter className="flex-row items-center justify-between border-t">
        <span className="text-xs text-muted-foreground">
          Created {format(parseISO(task.createdAt), 'MMM d, yyyy')}
        </span>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => {
            deleted.current = true
            deleteTask.mutate(task)
            onClose()
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </SheetFooter>
    </>
  )
}

const DURATIONS = [15, 30, 45, 60, 90, 120, 180]

const formatDuration = (minutes) =>
  minutes < 60 ? `${minutes} min` : `${minutes / 60} hr${minutes > 60 ? 's' : ''}`

/**
 * A time block for the task on the agenda. Also the keyboard-accessible way to
 * schedule, alongside drag and drop on the Today view.
 */
function ScheduleField({ task, onChange }) {
  const start = task.scheduledStart ? new Date(task.scheduledStart) : null
  const end = task.scheduledEnd ? new Date(task.scheduledEnd) : null
  const duration = start && end ? differenceInMinutes(end, start) : 30
  const date = start ? format(start, 'yyyy-MM-dd') : ''
  const time = start ? format(start, 'HH:mm') : ''

  // "2026-11-03T14:00" (no offset) parses as local time.
  const scheduleFor = (day, at, minutes = duration) => {
    const next = new Date(`${day}T${at}`)
    onChange({
      scheduledStart: next.toISOString(),
      scheduledEnd: addMinutes(next, minutes).toISOString(),
    })
  }
  const clear = () => onChange({ scheduledStart: null, scheduledEnd: null })

  return (
    <Field>
      <FieldLabel htmlFor="task-schedule-date">Schedule</FieldLabel>
      <div className="flex gap-2">
        <Input
          id="task-schedule-date"
          type="date"
          aria-label="Scheduled date"
          value={date}
          onChange={(e) =>
            e.target.value ? scheduleFor(e.target.value, time || '09:00') : clear()
          }
          className="min-w-0 flex-1"
        />
        <Input
          type="time"
          aria-label="Start time"
          value={time}
          step={900}
          onChange={(e) => e.target.value && scheduleFor(date || todayKey(), e.target.value)}
          className="w-28 shrink-0"
        />
        {start && (
          <>
            <Select
              value={String(duration)}
              onValueChange={(v) => scheduleFor(date, time, Number(v))}
            >
              <SelectTrigger aria-label="Duration" className="w-auto shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {formatDuration(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={clear} aria-label="Remove from schedule">
              <X className="size-4" />
            </Button>
          </>
        )}
      </div>
    </Field>
  )
}
