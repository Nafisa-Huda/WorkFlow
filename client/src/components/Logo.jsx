import { Check } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

export function Logo({ className, to = '/' }) {
  return (
    <Link to={to} className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Check className="size-4" strokeWidth={3} aria-hidden />
      </span>
      WorkFlow
    </Link>
  )
}
