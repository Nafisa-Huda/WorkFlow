import { format, parseISO } from 'date-fns'
import { Trash2, X } from 'lucide-react'
import { useEffect, useEffectEvent, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useLists } from '@/features/lists/api'
import type { Task } from '@/lib/types'
import { useDeleteTask, useUpdateTask, type TaskChanges } from './api'
import { ListSelect, PrioritySelect } from './TaskFields'

/** Side panel for editing a task. Changes save as you go: no Save button. */
export function TaskDetailSheet({
  task,
  onClose,
}: {
  task: Task | undefined
  onClose: () => void
}) {
  return (
    <Sheet open={!!task} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        {/* Keyed so local form state resets when a different task is opened. */}
        {task && <TaskDetailForm key={task.id} task={task} onClose={onClose} />}
      </SheetContent>
    </Sheet>
  )
}

function TaskDetailForm({ task, onClose }: { task: Task; onClose: () => void }) {
  const { data: lists = [] } = useLists()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes)

  const save = (changes: TaskChanges) => updateTask.mutate({ id: task.id, changes })

  const saveTitle = () => {
    const trimmed = title.trim()
    if (!trimmed) return setTitle(task.title) // a task can't have an empty title
    if (trimmed !== task.title) save({ title: trimmed })
  }
  const saveNotes = () => notes !== task.notes && save({ notes })

  // Closing the sheet (Esc, overlay click) unmounts the inputs without a blur event,
  // so flush any unsaved text on unmount too.
  const flushDrafts = useEffectEvent(() => {
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
