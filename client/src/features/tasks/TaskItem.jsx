import { format } from 'date-fns'
import { CalendarDays, Clock, Flag, NotebookText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ListColorDot } from '@/features/lists/ListColorDot'
import { formatDueLabel, isOverdue } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { useDeleteTask, useUpdateTask } from './api'
import { PRIORITY_CHECKBOX, PRIORITY_LABELS, PRIORITY_TEXT } from './priority'

export function TaskItem({ task, list, showDue = true, onOpen, dragHandle, className }) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const completed = !!task.completedAt
  const overdue = !completed && !!task.dueDate && isOverdue(task.dueDate)

  const meta = [
    showDue && task.dueDate && (
      <span key="due" className={cn('flex items-center gap-1', overdue && 'text-destructive')}>
        <CalendarDays className="size-3" />
        {formatDueLabel(task.dueDate)}
      </span>
    ),
    task.scheduledStart && (
      <span key="scheduled" className="flex items-center gap-1 text-primary">
        <Clock className="size-3" />
        {format(new Date(task.scheduledStart), 'h:mm a')}
      </span>
    ),
    task.priority !== 'none' && (
      <span key="priority" className={cn('flex items-center gap-1', PRIORITY_TEXT[task.priority])}>
        <Flag className="size-3" />
        {PRIORITY_LABELS[task.priority]}
      </span>
    ),
    list && (
      <span key="list" className="flex items-center gap-1.5">
        <ListColorDot color={list.color} />
        {list.name}
      </span>
    ),
    task.notes && <NotebookText key="notes" className="size-3" aria-label="Has notes" />,
  ].filter(Boolean)

  return (
    <li
      className={cn(
        'group relative flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60',
        className,
      )}
    >
      {dragHandle}
      <Checkbox
        checked={completed}
        onCheckedChange={(checked) =>
          updateTask.mutate({ id: task.id, changes: { completed: checked === true } })
        }
        aria-label={`Mark "${task.title}" as ${completed ? 'not done' : 'done'}`}
        className={cn('mt-0.5 size-[18px] rounded-full', PRIORITY_CHECKBOX[task.priority])}
      />
      <button
        type="button"
        onClick={() => onOpen(task)}
        className="min-w-0 flex-1 text-left outline-none focus-visible:underline"
      >
        <span
          className={cn(
            'block text-sm leading-5 break-words',
            completed && 'text-muted-foreground line-through',
          )}
        >
          {task.title}
        </span>
        {meta.length > 0 && (
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {meta}
          </span>
        )}
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => deleteTask.mutate(task)}
        aria-label={`Delete "${task.title}"`}
        className="size-7 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  )
}
