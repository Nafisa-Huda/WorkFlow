import { Plus } from 'lucide-react'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLists } from '@/features/lists/api'
import type { Priority } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCreateTask, type NewTask } from './api'
import { ListSelect, PrioritySelect } from './TaskFields'

/**
 * Inline "Add a task" input. Defaults (list, due date) come from the current
 * view, so a task added on Today is due today and one added in a list lands there.
 */
export function TaskComposer({ defaults = {} }: { defaults?: Omit<NewTask, 'title'> }) {
  const createTask = useCreateTask()
  const { data: lists = [] } = useLists()
  const inputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(defaults.dueDate ?? '')
  const [priority, setPriority] = useState<Priority>(defaults.priority ?? 'none')
  const [listId, setListId] = useState(defaults.listId ?? null)
  const expanded = title.length > 0

  const reset = () => {
    setTitle('')
    setDueDate(defaults.dueDate ?? '')
    setPriority(defaults.priority ?? 'none')
    setListId(defaults.listId ?? null)
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    createTask.mutate({ title: title.trim(), dueDate: dueDate || null, priority, listId })
    reset()
    inputRef.current?.focus() // ready for the next one: fast capture
  }

  return (
    <form
      onSubmit={onSubmit}
      onKeyDown={(e) => e.key === 'Escape' && reset()}
      className={cn(
        'rounded-lg border bg-card transition-shadow',
        expanded ? 'shadow-sm ring-1 ring-ring/30' : 'border-dashed',
      )}
    >
      <div className="flex items-center gap-2 px-3">
        <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          aria-label="New task title"
          maxLength={200}
          className="h-11 border-0 px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </div>
      {expanded && (
        <div className="flex flex-wrap items-center gap-2 border-t px-3 py-2">
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            aria-label="Due date"
            className="h-8 w-auto text-xs"
          />
          <PrioritySelect value={priority} onChange={setPriority} size="sm" />
          <ListSelect lists={lists} value={listId} onChange={setListId} size="sm" />
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={reset}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add task
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}
