import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { format } from 'date-fns'
import { GripVertical } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { isTempTask, useUpdateTask } from '@/features/tasks/api'
import { TaskItem } from '@/features/tasks/TaskItem'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { scheduleAt } from './layout'

interface DragData {
  task: Task
}
interface DropData {
  start: Date
}

const taskTitle = (data: unknown) => (data as DragData | undefined)?.task.title ?? 'Task'
const slotTime = (data: unknown) => {
  const start = (data as DropData | undefined)?.start
  return start ? format(start, 'h:mm a') : undefined
}

// Screen-reader announcements in task/time terms instead of dnd-kit's generic ids.
const announcements: Announcements = {
  onDragStart: ({ active }) => `Picked up ${taskTitle(active.data.current)}.`,
  onDragOver: ({ active, over }) =>
    over
      ? `${taskTitle(active.data.current)} is over ${slotTime(over.data.current)}.`
      : `${taskTitle(active.data.current)} is not over a time slot.`,
  onDragEnd: ({ active, over }) =>
    over
      ? `Scheduled ${taskTitle(active.data.current)} at ${slotTime(over.data.current)}.`
      : `${taskTitle(active.data.current)} was not scheduled.`,
  onDragCancel: ({ active }) => `Cancelled. ${taskTitle(active.data.current)} was not scheduled.`,
}

/** Drag tasks from a list onto agenda time slots to schedule them. */
export function ScheduleDndContext({ children }: { children: ReactNode }) {
  const updateTask = useUpdateTask()
  const [dragging, setDragging] = useState<Task | null>(null)
  const sensors = useSensors(
    // A small threshold so clicking a task (to open it) isn't mistaken for a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  )

  const onDragStart = ({ active }: DragStartEvent) =>
    setDragging((active.data.current as DragData).task)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setDragging(null)
    if (!over) return
    const { task } = active.data.current as DragData
    const { start } = over.data.current as DropData
    updateTask.mutate({ id: task.id, changes: scheduleAt(start, task) })
  }

  return (
    <DndContext
      sensors={sensors}
      // On a timeline the drop time is wherever the pointer is, not wherever the
      // preview chip overlaps (the default, which drifts when the agenda auto-scrolls).
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable:
            'To schedule this task, press space or enter, use the arrow keys to move it over a time, then press space or enter to drop. You can also set a time in the task details.',
        },
      }}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {dragging && (
          <div className="w-64 cursor-grabbing rounded-md border border-primary/40 bg-background px-3 py-2 text-sm font-medium shadow-lg">
            {dragging.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

const dragId = (task: Task) => `task:${task.id}`

/** A task row with a drag handle (shown on hover/focus). */
export function DraggableTaskItem(props: ComponentProps<typeof TaskItem>) {
  const { task } = props
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: dragId(task),
    data: { task } satisfies DragData,
    disabled: isTempTask(task) || !!task.completedAt,
  })
  const canDrag = !isTempTask(task) && !task.completedAt

  return (
    <TaskItem
      {...props}
      className={cn(isDragging && 'opacity-40')}
      dragHandle={
        canDrag && (
          <button
            type="button"
            // The handle is the measured node, so the drag preview starts at the cursor.
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            aria-label={`Drag "${task.title}" onto the schedule`}
            className="absolute top-2.5 -left-5 cursor-grab touch-none rounded text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing pointer-coarse:hidden"
          >
            <GripVertical className="size-4" />
          </button>
        )
      }
    />
  )
}

/** A half-hour drop target on the agenda. */
export function DropSlot({
  start,
  style,
  label,
}: {
  start: Date
  style: React.CSSProperties
  label: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${start.toISOString()}`,
    data: { start } satisfies DropData,
  })
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'pointer-events-none absolute rounded-md',
        isOver && 'z-20 bg-primary/15 ring-2 ring-primary/50 ring-inset',
      )}
    >
      {isOver && <span className="px-2 text-xs font-medium text-primary">{label}</span>}
    </div>
  )
}

/**
 * Agenda block for a scheduled task that can be dragged to a new time with a
 * pointer. Only the pointer listener is attached: Enter/Space on the block opens
 * the task (keyboard users reschedule from the task's Schedule field).
 */
export function DraggableAgendaBlock({
  task,
  children,
}: {
  task: Task
  children: (props: {
    ref: (node: HTMLElement | null) => void
    onPointerDown: ((event: React.PointerEvent) => void) | undefined
    isDragging: boolean
  }) => ReactNode
}) {
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: `agenda-${dragId(task)}`,
    data: { task } satisfies DragData,
    disabled: !!task.completedAt,
  })
  // dnd-kit types listeners loosely as Function; this one is a pointer handler.
  const onPointerDown = listeners?.onPointerDown as
    ((event: React.PointerEvent) => void) | undefined
  return children({ ref: setNodeRef, onPointerDown, isDragging })
}
