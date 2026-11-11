import { useState } from 'react'
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
import { LIST_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useCreateList, useUpdateList } from './api'
import { ListColorDot } from './ListColorDot'

/** Creates a new list, or edits `list` (its name and color) when one is passed. */
export function ListDialog({ open, onOpenChange, list }) {
  const navigate = useNavigate()
  const createList = useCreateList()
  const updateList = useUpdateList()
  const [name, setName] = useState(list?.name ?? '')
  const [color, setColor] = useState(list?.color ?? 'blue')
  const saving = createList.isPending || updateList.isPending

  const onSubmit = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    const input = { name: name.trim(), color }

    if (list) {
      updateList.mutate({ id: list.id, changes: input }, { onSuccess: () => onOpenChange(false) })
    } else {
      createList.mutate(input, {
        onSuccess: (created) => {
          onOpenChange(false)
          setName('')
          navigate(`/lists/${created.id}`)
        },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{list ? 'Edit list' : 'New list'}</DialogTitle>
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
            <Button type="submit" disabled={!name.trim() || saving}>
              {list ? 'Save' : 'Create list'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
