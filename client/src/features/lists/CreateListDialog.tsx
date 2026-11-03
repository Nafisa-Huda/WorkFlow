import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LIST_COLORS, type ListColor } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useCreateList } from './api'
import { ListColorDot } from './ListColorDot'

export function CreateListDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()
  const createList = useCreateList()
  const [name, setName] = useState('')
  const [color, setColor] = useState<ListColor>('blue')

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return
    createList.mutate(
      { name: name.trim(), color },
      {
        onSuccess: (list) => {
          onOpenChange(false)
          setName('')
          navigate(`/lists/${list.id}`)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>New list</DialogTitle>
            <DialogDescription>
              Group related tasks, like a project or area of life.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field>
              <FieldLabel htmlFor="list-name">Name</FieldLabel>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoFocus
              />
            </Field>
            <FieldSet>
              <FieldLegend variant="label">Color</FieldLegend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {LIST_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={color === c}
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full border',
                      color === c ? 'border-foreground' : 'border-transparent hover:border-border',
                    )}
                  >
                    <ListColorDot color={c} className="size-4" />
                  </button>
                ))}
              </div>
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" disabled={!name.trim() || createList.isPending}>
              Create list
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
