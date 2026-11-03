import { ChevronRight } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLists } from '@/features/lists/api'
import { DraggableTaskItem } from '@/features/agenda/dnd'
import type { List, Task } from '@/lib/types'
import { useDetailParams } from '@/lib/useDetailParams'
import { cn } from '@/lib/utils'
import type { NewTask } from './api'
import { TaskComposer } from './TaskComposer'
import { TaskItem } from './TaskItem'

/** Loading state of the query (or queries) behind a view. */
export interface ViewStatus {
  isPending: boolean
  isError: boolean
  refetch: () => unknown
}

export interface TaskSection {
  id: string
  title?: string
  tone?: 'default' | 'danger'
  tasks: Task[]
  /** Hide the due-date label when the section heading already says it. */
  hideDue?: boolean
}

/**
 * Shared layout for every task view: header, quick-add, sections, and a
 * collapsible "Completed" group, plus an optional side panel (the Today agenda).
 * Each page only decides which tasks go where.
 */
export function TaskView({
  title,
  subtitle,
  query,
  sections,
  completed = [],
  composerDefaults,
  composerKey,
  showList = true,
  draggable = false,
  aside,
  empty,
}: {
  title: string
  subtitle?: string
  query: ViewStatus
  sections: TaskSection[]
  completed?: Task[]
  composerDefaults?: Omit<NewTask, 'title'>
  /** Changes when the view's defaults change, to reset the composer. */
  composerKey?: string
  showList?: boolean
  /** Tasks can be dragged (onto the agenda). Requires a surrounding DndContext. */
  draggable?: boolean
  aside?: ReactNode
  empty: ReactNode
}) {
  const { data: lists = [] } = useLists()
  const listsById = useMemo(() => new Map(lists.map((l) => [l.id, l])), [lists])
  const { openTask } = useDetailParams()

  const listFor = (task: Task): List | undefined =>
    showList && task.listId ? listsById.get(task.listId) : undefined
  const hasOpenTasks = sections.some((s) => s.tasks.length > 0)
  const Item = draggable ? DraggableTaskItem : TaskItem

  const main = (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-8 sm:py-10">
      <title>{`${title} · WorkFlow`}</title>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </header>

      <TaskComposer key={composerKey} defaults={composerDefaults} />

      <div className="mt-6 space-y-8">
        {query.isPending ? (
          <TaskListSkeleton />
        ) : query.isError ? (
          <div className="rounded-lg border border-dashed p-8 text-center" role="alert">
            <p className="text-sm text-muted-foreground">Couldn&apos;t load your tasks.</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => query.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            {!hasOpenTasks && (
              <div className="py-12 text-center text-sm text-muted-foreground">{empty}</div>
            )}
            {sections
              .filter((section) => section.tasks.length > 0)
              .map((section) => (
                <section
                  key={section.id}
                  aria-labelledby={section.title ? `section-${section.id}` : undefined}
                >
                  {section.title && (
                    <h2
                      id={`section-${section.id}`}
                      className={cn(
                        'mb-1 flex items-baseline gap-2 border-b pb-2 text-sm font-semibold',
                        section.tone === 'danger' && 'text-destructive',
                      )}
                    >
                      {section.title}
                      <span className="text-xs font-normal text-muted-foreground">
                        {section.tasks.length}
                      </span>
                    </h2>
                  )}
                  <ul>
                    {section.tasks.map((task) => (
                      <Item
                        key={task.id}
                        task={task}
                        list={listFor(task)}
                        showDue={!section.hideDue}
                        onOpen={(t) => openTask(t.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            {completed.length > 0 && (
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
                  Completed
                  <span className="text-xs font-normal">{completed.length}</span>
                </summary>
                <ul className="mt-2">
                  {completed.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      list={listFor(task)}
                      onOpen={(t) => openTask(t.id)}
                    />
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  )

  if (!aside) return main
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
      {main}
      <aside className="h-[32rem] border-t lg:sticky lg:top-0 lg:h-svh lg:border-t-0 lg:border-l">
        {aside}
      </aside>
    </div>
  )
}

function TaskListSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex items-center gap-3 px-2">
          <Skeleton className="size-[18px] rounded-full" />
          <Skeleton className="h-4" style={{ width: `${70 - i * 12}%` }} />
        </div>
      ))}
    </div>
  )
}
