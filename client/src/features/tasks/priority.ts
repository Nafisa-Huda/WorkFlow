import type { Priority } from '@/lib/types'

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: 'No priority',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

/** Checkbox ring color, so priority is visible at a glance without extra badges. */
export const PRIORITY_CHECKBOX: Record<Priority, string> = {
  none: '',
  low: 'border-blue-500',
  medium: 'border-amber-500',
  high: 'border-red-500',
}

export const PRIORITY_TEXT: Record<Priority, string> = {
  none: 'text-muted-foreground',
  low: 'text-blue-600 dark:text-blue-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
}
