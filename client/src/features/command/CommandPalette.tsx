import {
  CalendarDays,
  CalendarPlus,
  CalendarRange,
  CircleCheck,
  Inbox,
  ListPlus,
  Plus,
  Sun,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command'
import { useLists } from '@/features/lists/api'
import { CreateListDialog } from '@/features/lists/CreateListDialog'
import { ListColorDot } from '@/features/lists/ListColorDot'
import { useCreateTask, useTasks } from '@/features/tasks/api'
import { formatDueLabel } from '@/lib/dates'
import { useDetailParams } from '@/lib/useDetailParams'
import { CommandPaletteContext } from './context'

/** Provides the ⌘K / Ctrl+K command palette to everything inside the app shell. */
export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <CommandPaletteContext value={{ open: () => setOpen(true) }}>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </CommandPaletteContext>
  )
}

function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const { openTask, newEvent } = useDetailParams()
  const { data: lists = [] } = useLists()
  // Same query as the sidebar counts, so it's already cached.
  const { data: tasks = [] } = useTasks({ status: 'open' })
  const createTask = useCreateTask()
  const [search, setSearch] = useState('')
  const [creatingList, setCreatingList] = useState(false)

  const run = (action: () => void) => {
    onOpenChange(false)
    setSearch('')
    action()
  }

  const go = (path: string) => run(() => navigate(path))

  return (
    <>
      <CommandDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Command palette"
        description="Search tasks, jump to a view, or run an action"
      >
        <Command>
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search tasks or type a command…"
          />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>

            {search.trim() && (
              // forceMount on both: cmdk hides groups whose items don't match the filter.
              <CommandGroup heading="Create" forceMount>
                <CommandItem
                  forceMount
                  value={`create-task ${search}`}
                  onSelect={() =>
                    run(() =>
                      createTask.mutate(
                        { title: search.trim() },
                        { onSuccess: () => toast.success('Added to Inbox') },
                      ),
                    )
                  }
                >
                  <Plus />
                  Add task “{search.trim()}”
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Go to">
              <CommandItem onSelect={() => go('/today')}>
                <Sun />
                Today
              </CommandItem>
              <CommandItem onSelect={() => go('/upcoming')}>
                <CalendarRange />
                Upcoming
              </CommandItem>
              <CommandItem onSelect={() => go('/inbox')}>
                <Inbox />
                Inbox
              </CommandItem>
              <CommandItem onSelect={() => go('/calendar')}>
                <CalendarDays />
                Calendar
              </CommandItem>
              {lists.map((list) => (
                <CommandItem
                  key={list.id}
                  value={`list ${list.name} ${list.id}`}
                  onSelect={() => go(`/lists/${list.id}`)}
                >
                  <ListColorDot color={list.color} className="mx-1" />
                  {list.name}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => run(() => newEvent())}>
                <CalendarPlus />
                New event
              </CommandItem>
              <CommandItem onSelect={() => run(() => setCreatingList(true))}>
                <ListPlus />
                New list
              </CommandItem>
            </CommandGroup>

            {tasks.length > 0 && (
              <CommandGroup heading="Tasks">
                {tasks.map((task) => (
                  <CommandItem
                    key={task.id}
                    // Unique value (cmdk de-dupes by value); the title is what's searched.
                    value={`task ${task.title} ${task.id}`}
                    onSelect={() => run(() => openTask(task.id))}
                  >
                    <CircleCheck className="text-muted-foreground" />
                    <span className="truncate">{task.title}</span>
                    {task.dueDate && (
                      <CommandShortcut>{formatDueLabel(task.dueDate)}</CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
      <CreateListDialog open={creatingList} onOpenChange={setCreatingList} />
    </>
  )
}
