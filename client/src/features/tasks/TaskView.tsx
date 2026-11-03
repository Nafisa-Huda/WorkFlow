import type { UseQueryResult } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useLists } from '@/features/lists/api'
import type { List, Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import type { NewTask } from './api'
import { TaskComposer } from './TaskComposer'
import { TaskDetailSheet } from './TaskDetailSheet'
import { TaskItem } from './TaskItem'

export interface TaskSection {
  id: string
  title?: string
  tone?: 'default' | 'danger'
  tasks: Task[]
  /** Hide the due-date label when the section heading already says it. */
  hideDue?: boolean
}

/**
 * Shared layout for every task view: header, quick-add, sections, a collapsible
 * "Completed" group, and the detail sheet. Each page only decides which tasks
 * go where.
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
  empty,
}: {
  title: string
  subtitle?: string
  query: UseQueryResult<Task[]>
  sections: TaskSection[]
  completed?: Task[]
  composerDefaults?: Omit<NewTask, 'title'>
  /** Changes when the view's defaults change, to reset the composer. */
  composerKey?: string
  showList?: boolean
  empty: ReactNode
}) {
  const { data: lists = [] } = useLists()
  const listsById = useMemo(() => new Map(lists.map((l) => [l.id, l])), [lists])
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  // Look the task up in fresh data so the sheet reflects optimistic edits.
  const openTask = query.data?.find((t) => t.id === openTaskId)

  const listFor = (task: Task): List | undefined =>
    showList && task.listId ? listsById.get(task.listId) : undefined
  const hasOpenTasks = sections.some((s) => s.tasks.length > 0)

  return (
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
                      <TaskItem
                        key={task.id}
                        task={task}
                        list={listFor(task)}
                        showDue={!section.hideDue}
                        onOpen={(t) => setOpenTaskId(t.id)}
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
                      onOpen={(t) => setOpenTaskId(t.id)}
                    />
                  ))}
                </ul>
              </details>
            )}
          </>
        )}
      </div>

      <TaskDetailSheet task={openTask} onClose={() => setOpenTaskId(null)} />
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
