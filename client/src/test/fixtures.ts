import type { List, Task, User } from '@/lib/types'

export const user: User = { id: 'u1', name: 'Ada', email: 'ada@example.com' }

export const workList: List = { id: 'list-work', name: 'Work', color: 'blue', order: 0 }

export function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: crypto.randomUUID(),
    title: 'A task',
    notes: '',
    listId: null,
    priority: 'none',
    dueDate: null,
    scheduledStart: null,
    scheduledEnd: null,
    completedAt: null,
    order: 0,
    createdAt: '2026-10-30T12:00:00.000Z',
    updatedAt: '2026-10-30T12:00:00.000Z',
    ...overrides,
  }
}
