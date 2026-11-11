import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { useState } from 'react'
import { useUpdateTask } from '@/features/tasks/api'
import { TaskItem } from '@/features/tasks/TaskItem'
import { cn } from '@/lib/utils'
import { scheduleAt } from './layout'

/** Drag tasks from a list onto agenda time slots to schedule them. */
export function ScheduleDndContext({ children }) {
  const updateTask = useUpdateTask()
  const [dragging, setDragging] = useState(null)
  // A drag only starts after the pointer moves 5px, so clicking a task still opens it.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const onDragStart = ({ active }) => setDragging(active.data.current.task)

  const onDragEnd = ({ active, over }) => {
    setDragging(null)
    if (!over) return
    const { task } = active.data.current
    const { start } = over.data.current
    updateTask.mutate({ id: task.id, changes: scheduleAt(start, task) })
  }

  return (
    <DndContext
      sensors={sensors}
      // Drop onto the time slot under the pointer.
      collisionDetection={pointerWithin}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setDragging(null)}
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

/** A task row with a drag handle (shown on hover). Completed tasks can't be dragged. */
export function DraggableTaskItem(props) {
  const { task } = props
  const canDrag = !task.completedAt
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canDrag,
  })

  return (
    <TaskItem
      {...props}
      className={cn(isDragging && 'opacity-40')}
      dragHandle={
        canDrag && (
          <button
            type="button"
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
export function DropSlot({ start, style, label }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot:${start.toISOString()}`,
    data: { start },
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
