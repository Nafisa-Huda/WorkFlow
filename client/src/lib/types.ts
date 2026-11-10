// Mirrors the JSON returned by the API (server/src/models).

export interface User {
  id: string
  name: string
  email: string
}

export const LIST_COLORS = [
  'slate',
  'red',
  'orange',
  'amber',
  'green',
  'teal',
  'blue',
  'violet',
  'pink',
] as const
export type ListColor = (typeof LIST_COLORS)[number]

export interface List {
  id: string
  name: string
  color: ListColor
}

export const PRIORITIES = ['none', 'low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface Task {
  id: string
  title: string
  notes: string
  listId: string | null
  priority: Priority
  /** Calendar day, "YYYY-MM-DD". */
  dueDate: string | null
  /** ISO datetimes. */
  scheduledStart: string | null
  scheduledEnd: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}
