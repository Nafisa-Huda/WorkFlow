import { ListColorDot } from '@/features/lists/ListColorDot'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PRIORITIES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { PRIORITY_LABELS, PRIORITY_TEXT } from './priority'
import { Flag, Inbox } from 'lucide-react'

// Radix Select can't use "" as an item value, so the inbox gets a sentinel.
const INBOX = 'inbox'

export function ListSelect({ lists, value, onChange, id, size }) {
  return (
    <Select value={value ?? INBOX} onValueChange={(v) => onChange(v === INBOX ? null : v)}>
      <SelectTrigger id={id} size={size} aria-label="List">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={INBOX}>
          <Inbox className="size-3.5 text-muted-foreground" />
          Inbox
        </SelectItem>
        {lists.map((list) => (
          <SelectItem key={list.id} value={list.id}>
            <ListColorDot color={list.color} />
            {list.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function PrioritySelect({ value, onChange, id, size }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} size={size} aria-label="Priority">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {[...PRIORITIES].reverse().map((p) => (
          <SelectItem key={p} value={p}>
            <Flag className={cn('size-3.5', PRIORITY_TEXT[p])} />
            {PRIORITY_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
