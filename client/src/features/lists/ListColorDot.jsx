import { cn } from '@/lib/utils'

// Full class names (not built from strings) so Tailwind can find them at build time.
const COLOR_CLASSES = {
  slate: 'bg-slate-400',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
  teal: 'bg-teal-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
  pink: 'bg-pink-500',
}

export function ListColorDot({ color, className }) {
  return (
    <span
      aria-hidden
      className={cn('size-2 shrink-0 rounded-full', COLOR_CLASSES[color], className)}
    />
  )
}
