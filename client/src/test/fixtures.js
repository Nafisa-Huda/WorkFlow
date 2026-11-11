export const user = { id: 'u1', name: 'Ada', email: 'ada@example.com' }

export const workList = { id: 'list-work', name: 'Work', color: 'blue' }

export function makeTask(overrides = {}) {
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
    createdAt: '2026-10-30T12:00:00.000Z',
    updatedAt: '2026-10-30T12:00:00.000Z',
    ...overrides,
  }
}
